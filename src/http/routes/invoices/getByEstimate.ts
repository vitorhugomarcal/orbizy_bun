import Elysia, { t } from "elysia"
import { db } from "../../../lib/prisma"
import { auth } from "../../authentication"
import { AuthError } from "../errors/auth-error"

export const getInvoiceByEstimateId = new Elysia().get(
  `/invoice/:estimateId`,
  async ({ cookie, params }) => {
    const user = await auth({ cookie })
    if (!user) {
      throw new AuthError("Unauthorized", "UNAUTHORIZED", 401)
    }

    const { estimateId } = params

    if (!estimateId) {
      throw new AuthError("Orçamento não encontrado", "ESTIMATE_NOT_FOUND", 404)
    }

    const invoice = await db.invoice.findFirst({
      where: {
        estimate_id: estimateId,
      },
    })

    if (!invoice) {
      throw new AuthError("Fatura não encontrada", "INVOICE_NOT_FOUND", 404)
    }

    return {
      message: "Fatura encontrada",
      invoice,
    }
  },
  {
    params: t.Object({
      estimateId: t.String(),
    }),
    response: {
      200: t.Object(
        {
          message: t.String(),
          invoice: t.Object({
            id: t.String(),
          }),
        },
        {
          description: "Fatura encontrada",
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
          description: "Fatura não encontrada",
        }
      ),
    },
    detail: {
      description: "Get a invoice by estimateID",
      tags: ["Invoice"],
    },
  }
)
