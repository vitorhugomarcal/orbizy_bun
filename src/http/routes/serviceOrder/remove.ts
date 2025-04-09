import Elysia, { t } from "elysia"
import { db } from "../../../lib/prisma"
import { auth } from "../../authentication"
import { AuthError } from "../errors/auth-error"

export const removeServiceOrder = new Elysia().delete(
  `/order/remove/:orderId`,
  async ({ cookie, params }) => {
    const user = await auth({ cookie })
    if (!user) {
      throw new AuthError("Unauthorized", "UNAUTHORIZED", 401)
    }

    const { orderId } = params

    if (!orderId) {
      throw new AuthError(
        "Ordem de serviço não encontrada",
        "ORDER_NOT_FOUND",
        404
      )
    }

    await db.serviceOrder.delete({
      where: {
        id: orderId,
      },
    })

    return {
      message: "Service order removed successfully",
    }
  },
  {
    params: t.Object({
      orderId: t.String(),
    }),
    response: {
      204: t.Object(
        {
          message: t.String(),
        },
        {
          description: "Service order removed successfully",
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
          description: "Service order not found",
        }
      ),
    },
    detail: {
      description: "Remove a service order",
      tags: ["ServiceOrder"],
    },
  }
)
