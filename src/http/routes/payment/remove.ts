import Elysia, { t } from "elysia"
import { db } from "../../../lib/prisma"
import { auth } from "../../authentication"
import { AuthError } from "../errors/auth-error"

export const removePayment = new Elysia().delete(
  `/payment/remove/:paymentId`,
  async ({ cookie, params }) => {
    const user = await auth({ cookie })
    if (!user) {
      throw new AuthError("Unauthorized", "UNAUTHORIZED", 401)
    }

    const { paymentId } = params

    if (!paymentId) {
      throw new AuthError("Payment não encontrado", "Payment_NOT_FOUND", 404)
    }

    await db.paymentModeCustom.delete({
      where: {
        id: paymentId,
      },
    })
    return {
      message: "Payment removido com sucesso",
    }
  },
  {
    params: t.Object({
      paymentId: t.String(),
    }),
    response: {
      204: t.Object(
        {
          message: t.String(),
        },
        {
          description: "Pagamento removido com sucesso",
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
          description: "Pagamento não encontrado",
        }
      ),
    },
    detail: {
      description: "Remove a payment",
      tags: ["Payment"],
    },
  }
)
