import Elysia, { t } from "elysia"
import { db } from "../../../lib/prisma"
import { auth } from "../../authentication"
import { AuthError } from "../errors/auth-error"

export const removeInvoice = new Elysia().delete(
  `/invoice/remove/:invoiceId`,
  async ({ cookie, params }) => {
    const user = await auth({ cookie })
    if (!user) {
      throw new AuthError("Unauthorized", "UNAUTHORIZED", 401)
    }

    const { invoiceId } = params

    if (!invoiceId) {
      throw new AuthError("Fatura não encontrado", "INVOICE_NOT_FOUND", 404)
    }

    await db.invoice.delete({
      where: {
        id: invoiceId,
      },
    })

    return {
      message: "Invoice removed successfully",
    }
  },
  {
    params: t.Object({
      invoiceId: t.String(),
    }),
    response: {
      204: t.Object(
        {
          message: t.String(),
        },
        {
          description: "Invoice removed successfully",
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
          description: "Invoice not found",
        }
      ),
    },
    detail: {
      description: "Remove a invoice",
      tags: ["Invoice"],
    },
  }
)
