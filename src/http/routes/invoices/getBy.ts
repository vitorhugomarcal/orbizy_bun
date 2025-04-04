import Elysia, { t } from "elysia"
import { db } from "../../../lib/prisma"
import { auth } from "../../authentication"
import { AuthError } from "../errors/auth-error"

export const getInvoiceById = new Elysia().get(
  `/invoice/:invoiceId`,
  async ({ cookie, params }) => {
    const user = await auth({ cookie })
    if (!user) {
      throw new AuthError("Unauthorized", "UNAUTHORIZED", 401)
    }

    const { invoiceId } = params

    if (!invoiceId) {
      throw new AuthError("Orçamento não encontrado", "ESTIMATE_NOT_FOUND", 404)
    }

    const invoice = await db.invoice.findUnique({
      where: {
        id: invoiceId,
      },
      include: {
        estimate: {
          include: {
            client: { include: { address: true } },
          },
        },
      },
    })

    if (!invoice) {
      throw new AuthError("Orçamento não encontrado", "ESTIMATE_NOT_FOUND", 404)
    }

    const formattedInvoice = {
      ...invoice,
      total: Number(invoice.total),
      estimate: {
        ...invoice.estimate,
        sub_total: Number(invoice.estimate.sub_total),
        total: Number(invoice.estimate.total),
      },
    }

    return {
      message: "Orçamento encontrado",
      invoice: formattedInvoice,
    }
  },
  {
    params: t.Object({
      invoiceId: t.String(),
    }),
    response: {
      200: t.Object(
        {
          message: t.String(),
          invoice: t.Object({
            id: t.String(),
            invoice_number: t.Nullable(t.String()),
            payment_mode: t.Nullable(t.String()),
            status: t.Nullable(t.String()),
            notes: t.Nullable(t.String()),
            total: t.Number(),
            paymentUrl: t.Nullable(t.String()),
            estimate: t.Object({
              id: t.String(),
              estimate_number: t.String(),
              status: t.String(),
              notes: t.String(),
              sub_total: t.Number(),
              total: t.Number(),
              client: t.Object({
                id: t.String(),
                name: t.String(),
                type: t.String(),
                company_name: t.Nullable(t.String()),
                cnpj: t.Nullable(t.String()),
                cpf: t.Nullable(t.String()),
                ssn: t.Nullable(t.String()),
                ein: t.Nullable(t.String()),
                email_address: t.String(),
                phone: t.String(),
                address: t.Object({
                  id: t.String(),
                  country: t.String(),
                  city: t.String(),
                  state: t.String(),
                  postal_code: t.String(),
                  street: t.Nullable(t.String()),
                  number: t.Nullable(t.String()),
                  neighborhood: t.Nullable(t.String()),
                  street_address: t.Nullable(t.String()),
                  unit_number: t.Nullable(t.String()),
                }),
              }),
            }),
          }),
        },
        {
          description: "Orçamento encontrado",
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
      404: t.Object(
        {
          message: t.String(),
        },
        {
          description: "Orçamento não encontrado",
        }
      ),
    },
    detail: {
      description: "Get a invoice by ID",
      tags: ["Invoice"],
    },
  }
)
