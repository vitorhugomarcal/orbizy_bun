import Elysia, { t } from "elysia"
import { db } from "../../../lib/prisma"
import { auth } from "../../authentication"
import { AuthError } from "../errors/auth-error"

export const removeEstimateSupplierItem = new Elysia().delete(
  `/supplier/itens/estimate/remove/:itemId`,
  async ({ cookie, params }) => {
    const user = await auth({ cookie })
    if (!user) {
      throw new AuthError("Unauthorized", "UNAUTHORIZED", 401)
    }

    const { itemId } = params

    if (!itemId) {
      throw new AuthError(
        "Item do orçamento não encontrado",
        "ITEM_NOT_FOUND",
        404
      )
    }

    await db.estimateSupplierItems.delete({
      where: {
        id: itemId,
      },
    })

    return {
      message: "Item do orçamento removido com sucesso",
    }
  },
  {
    params: t.Object({
      itemId: t.String(),
    }),
    response: {
      204: t.Object(
        {
          message: t.String(),
        },
        {
          description: "Item do orçamento removido com sucesso",
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
          description: "Item do orçamento não encontrado",
        }
      ),
    },
    detail: {
      description: "Remove an estimate item",
      tags: ["EstimateSupplierItem"],
    },
  }
)
