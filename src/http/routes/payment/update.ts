import Elysia, { t } from "elysia"
import { db } from "../../../lib/prisma"
import { auth } from "../../authentication"
import { AuthError } from "../errors/auth-error"

export const updatePayment = new Elysia().put(
  `/payment/update/:paymentId`,
  async ({ cookie, body, params }) => {
    const { name, type, code } = body

    const user = await auth({ cookie })
    if (!user) {
      throw new AuthError("Unauthorized", "UNAUTHORIZED", 401)
    }

    const { paymentId } = params

    if (!paymentId) {
      throw new AuthError("Item não encontrado", "ITEM_NOT_FOUND", 404)
    }

    const checkPaymentExists = await db.paymentModeCustom.findUnique({
      where: {
        id: paymentId,
      },
    })
    if (!checkPaymentExists) {
      throw new AuthError("Item não encontrado", "ITEM_NOT_FOUND", 404)
    }

    const payment = await db.paymentModeCustom.update({
      where: {
        id: paymentId,
      },
      data: {
        name,
        type,
        code,
      },
    })

    return {
      message: "Payment atualizado com sucesso",
      payment,
    }
  },
  {
    body: t.Object({
      name: t.Optional(t.String()),
      type: t.Optional(t.String()),
      code: t.Optional(t.String()),
    }),
    response: {
      201: t.Object(
        {
          message: t.String(),
          payment: t.Object({
            name: t.String(),
            type: t.String(),
            code: t.String(),
          }),
        },
        {
          description: "Payment atualizado com sucesso",
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
      description: "Update a payment",
      tags: ["Payment"],
    },
  }
)
