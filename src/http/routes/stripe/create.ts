import Elysia, { t } from "elysia"
import Stripe from "stripe"
import { env } from "../../../env"
import { db } from "../../../lib/prisma"
import { auth } from "../../authentication"
import { AuthError } from "../errors/auth-error"

export const createInvoice = new Elysia().post(
  `/stripe/create/invoice/:invoiceId`,
  async ({ cookie, params }) => {
    const stripe = new Stripe(env.STRIPE_SECRET_KEY)

    const user = await auth({ cookie })

    if (!user) {
      throw new AuthError("Unauthorized", "UNAUTHORIZED", 401)
    }

    const { invoiceId } = params

    if (!invoiceId) {
      throw new AuthError(
        "Invoice ID not provided",
        "INVOICE_ID_NOT_PROVIDED",
        400
      )
    }

    const hasCompany = user.Company

    if (!hasCompany) {
      throw new AuthError("Company not found", "COMPANY_NOT_FOUND", 404)
    }

    const invoice = await db.invoice.findUnique({
      where: {
        id: invoiceId,
      },
      include: {
        estimate: {
          include: {
            EstimateItems: true,
            client: {
              include: {
                address: true,
              },
            },
          },
        },
      },
    })

    if (!invoice) {
      throw new AuthError("Fatura não encontrada", "INVOICE_NOT_FOUND", 404)
    }

    if (!hasCompany.stripeAccountId) {
      throw new AuthError(
        "A empresa não possui uma conta Stripe Connect ativa",
        "STRIPE_CONNECT_NOT_ACTIVE",
        400
      )
    }

    let stripeCustomer = await stripe.customers.create(
      {
        email: invoice.estimate.client?.email_address,
        name: invoice.estimate.client?.name,
        phone: invoice.estimate.client?.phone,
        address: {
          line1: invoice.estimate.client?.address?.street || "",
          line2: invoice.estimate.client?.address?.number || "",
          city: invoice.estimate.client?.address?.city,
          state: invoice.estimate.client?.address?.state,
          postal_code: invoice.estimate.client?.address?.postal_code,
          country: invoice.estimate.client?.address?.country,
        },
      },
      {
        stripeAccount: hasCompany.stripeAccountId,
      }
    )

    const stripeInvoice = await stripe.invoices.create(
      {
        customer: stripeCustomer.id,
        collection_method: "send_invoice",
        payment_settings: {
          payment_method_types: ["card"],
        },
        days_until_due: 7, // Ajuste conforme necessário
        auto_advance: false, // Impede que a invoice seja finalizada automaticamente
        metadata: {
          invoiceId: invoice.id,
        },
        number: invoice.invoice_number || "",
      },
      {
        stripeAccount: hasCompany.stripeAccountId,
      }
    )

    for (const item of invoice.estimate.EstimateItems) {
      try {
        await stripe.invoiceItems.create(
          {
            customer: stripeCustomer.id,
            description: item.description
              ? `${item.name} - ${item.description}`
              : item.name,
            currency: "brl",
            quantity: Number(item.quantity),
            unit_amount: Math.round(Number(item.price) * 100),
            invoice: stripeInvoice.id,
          },
          {
            stripeAccount: hasCompany.stripeAccountId,
          }
        )
      } catch (error) {
        console.error(`Erro ao criar item da fatura`)
      }
    }

    const finalizedInvoice = await stripe.invoices.finalizeInvoice(
      stripeInvoice.id,
      {
        auto_advance: true, // Isso permite que a invoice seja enviada imediatamente
      },
      {
        stripeAccount: hasCompany.stripeAccountId,
      }
    )

    await db.invoice.update({
      where: { id: invoiceId },
      data: {
        stripeInvoiceId: finalizedInvoice.id,
        status: "PENDING",
        paymentUrl: finalizedInvoice.hosted_invoice_url,
      },
    })

    return {
      message: "Fatura cadastrada com sucesso",
      stripeInvoice: {
        id: finalizedInvoice.id,
        amount: finalizedInvoice.amount_due,
        status: finalizedInvoice.status,
        paymentUrl: finalizedInvoice.hosted_invoice_url,
      },
    }
  },
  {
    params: t.Object({
      invoiceId: t.String(),
    }),
    response: {
      201: t.Object(
        {
          message: t.String(),
          stripeInvoice: t.Object({
            id: t.String(),
            amount: t.Number(),
            status: t.String(),
            paymentUrl: t.String(),
          }),
        },
        {
          description: "Fatura cadastrada com sucesso",
        }
      ),
      401: t.Object(
        {
          message: t.String(),
        },
        {
          description: "Unauthorized",
        }
      ),
      400: t.Object(
        {
          message: t.String(),
        },
        {
          description: "Fatura já cadastrada",
        }
      ),
      404: t.Object(
        {
          message: t.String(),
        },
        {
          description: "Company not found",
        }
      ),
    },
    detail: {
      description: "Cadastra uma nova fatura",
      tags: ["Stripe"],
    },
  }
)
