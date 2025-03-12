import Elysia, { t } from "elysia"
import { db } from "../../../lib/prisma"
import { auth } from "../../authentication"
import { AuthError } from "../errors/auth-error"

export const updateInvoice = new Elysia().put(
  `/invoice/update/:invoiceId`,
  async ({ cookie, body, params }) => {
    const { invoice_number, status, notes, payment_mode, total } = body
    const user = await auth({ cookie })
    if (!user) {
      throw new AuthError("Unauthorized", "UNAUTHORIZED", 401)
    }

    const { invoiceId } = params

    if (!invoiceId) {
      throw new AuthError("Fatura não encontrado", "INVOICE_NOT_FOUND", 404)
    }

    const checkInvoiceExists = await db.invoice.findUnique({
      where: {
        id: invoiceId,
      },
    })

    if (!checkInvoiceExists) {
      throw new AuthError("Fatura não encontrado", "INVOICE_NOT_FOUND", 404)
    }

    const invoice = await db.invoice.update({
      where: {
        id: invoiceId,
      },
      data: {
        invoice_number,
        payment_mode,
        status,
        notes,
        total,
      },
    })

    const formattedInvoice = {
      ...invoice,
      total: Number(invoice.total),
    }

    return {
      message: "Fatura atualizado com sucesso",
      invoice: formattedInvoice,
    }
  },
  {
    body: t.Object({
      invoice_number: t.Optional(t.String()),
      status: t.Optional(t.String()),
      payment_mode: t.Optional(t.String()),
      notes: t.Optional(t.String()),
      total: t.Optional(t.Number()),
    }),
    params: t.Object({
      invoiceId: t.String(),
    }),
    response: {
      201: t.Object(
        {
          message: t.String(),
          invoice: t.Object({
            invoice_number: t.String(),
            payment_mode: t.String(),
            status: t.String(),
            notes: t.String(),
            total: t.Number(),
          }),
        },
        {
          description: "Fatura atualizado com sucesso",
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
          description: "Fatura não encontrado",
        }
      ),
    },
    detail: {
      description: "Update a invoice",
      tags: ["Invoice"],
    },
  }
)
