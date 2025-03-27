import Elysia, { t } from "elysia"
import { db } from "../../../lib/prisma"
import { auth } from "../../authentication"
import { AuthError } from "../errors/auth-error"

export const getById = new Elysia().get(
  "/payment/:paymentId",
  async ({ cookie, params }) => {
    const user = await auth({ cookie })
    if (!user) {
      throw new AuthError("Unauthorized", "UNAUTHORIZED", 401)
    }

    const { paymentId } = params

    if (!paymentId) {
      throw new AuthError("Payment não encontrado", "Payment_NOT_FOUND", 404)
    }

    const checkPaymentExists = await db.paymentModeCustom.findUnique({
      where: {
        id: paymentId,
      },
    })
    if (!checkPaymentExists) {
      throw new AuthError("Payment não encontrado", "Payment_NOT_FOUND", 404)
    }

    const payment = await db.paymentModeCustom.findUnique({
      where: {
        id: paymentId,
      },
    })

    if (!payment) {
      throw new AuthError("Payment não encontrado", "Payment_NOT_FOUND", 404)
    }

    return {
      message: "Payment encontrado",
      payment,
    }
  },
  {
    params: t.Object({
      paymentId: t.String(),
    }),
    response: {
      200: t.Object(
        {
          message: t.String(),
          payment: t.Object({
            id: t.String(),
            name: t.String(),
            code: t.String(),
          }),
        },
        {
          description: "Payment encontrado",
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
          description: "Payment não encontrado",
        }
      ),
    },
    detail: {
      description: "Get a Payment by id",
      tags: ["Payment"],
    },
  }
)
