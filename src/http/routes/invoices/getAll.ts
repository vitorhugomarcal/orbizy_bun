import Elysia, { t } from "elysia"
import { db } from "../../../lib/prisma"
import { auth } from "../../authentication"
import { AuthError } from "../errors/auth-error"

export const getAllInvoices = new Elysia().get(
  "/invoice",
  async ({ cookie }) => {
    const user = await auth({ cookie })
    if (!user) {
      throw new AuthError("Unauthorized", "UNAUTHORIZED", 401)
    }

    const hasCompany = user.Company

    if (!hasCompany) {
      throw new AuthError("Company not found", "COMPANY_NOT_FOUND", 404)
    }

    const invoices = await db.invoice.findMany({
      where: {
        company_id: hasCompany.id,
      },
      include: {
        estimate: {
          include: {
            client: {
              include: {
                address: true,
              },
            },
          },
        },
      },
    })

    if (!invoices) {
      throw new AuthError("Faturas não encontradas", "INVOICES_NOT_FOUND", 404)
    }

    const formattedEstimates = invoices.map((invoice) => {
      return {
        ...invoice,
        createdAt: String(invoice.createdAt),
        total: Number(invoice.total),
      }
    })
    return {
      message: "Faturas encontradas",
      invoices: formattedEstimates,
    }
  },
  {
    response: {
      200: t.Object(
        {
          message: t.String(),
          invoices: t.Array(
            t.Object({
              id: t.String(),
              invoice_number: t.Nullable(t.String()),
              payment_mode: t.Nullable(t.String()),
              paymentUrl: t.Nullable(t.String()),
              status: t.Nullable(t.String()),
              notes: t.Nullable(t.String()),
              total: t.Number(),
              createdAt: t.String(),
              estimate_id: t.String(),
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
            })
          ),
        },
        {
          description: "Orçamentos encontrados",
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
          description: "Orçamentos não encontrados",
        }
      ),
    },
    detail: {
      description: "Get all invoices",
      tags: ["Invoice"],
    },
  }
)
