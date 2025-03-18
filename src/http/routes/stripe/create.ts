import Elysia, { t } from "elysia"
import Stripe from "stripe"
import { env } from "../../../env"
import { db } from "../../../lib/prisma"
import { auth } from "../../authentication"
import { AuthError } from "../errors/auth-error"

export const createInvoice = new Elysia().post(
  `/stripe/create/invoice`,
  async ({ cookie, body }) => {
    const stripe = new Stripe(env.STRIPE_SECRET_KEY)
    const { invoiceId } = body

    const user = await auth({ cookie })
    if (!user) {
      throw new AuthError("Unauthorized", "UNAUTHORIZED", 401)
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
            client: true,
          },
        },
      },
    })

    if (!invoice || !hasCompany) {
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
      },
      {
        stripeAccount: hasCompany.stripeAccountId,
      }
    )

    const invoiceItem = await stripe.invoiceItems.create(
      {
        customer: stripeCustomer.id,
        amount: Number(invoice.total) * 100, // Stripe usa centavos
        currency: "brl",
        description: `Invoice ${invoice.invoice_number}`,
      },
      {
        stripeAccount: hasCompany.stripeAccountId,
      }
    )

    const stripeInvoice = await stripe.invoices.create(
      {
        customer: stripeCustomer.id,
        collection_method: "send_invoice",
        days_until_due: 30, // Ajuste conforme necessário
        metadata: {
          invoiceId: invoice.id,
        },
      },
      {
        stripeAccount: hasCompany.stripeAccountId,
      }
    )

    await stripe.invoices.finalizeInvoice(stripeInvoice.id, {
      stripeAccount: hasCompany.stripeAccountId,
    })

    await db.invoice.update({
      where: { id: invoiceId },
      data: {
        stripeInvoiceId: stripeInvoice.id,
        status: "PENDING",
        paymentUrl: stripeInvoice.hosted_invoice_url,
      },
    })

    return {
      message: "Fatura cadastrada com sucesso",
      stripeInvoice: {
        id: stripeInvoice.id,
        amount: stripeInvoice.amount_due,
        status: stripeInvoice.status,
        paymentUrl: stripeInvoice.hosted_invoice_url,
      },
    }
  },
  {
    body: t.Object({
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
