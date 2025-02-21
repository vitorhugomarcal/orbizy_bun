import Elysia, { t } from "elysia"
import { db } from "../../../lib/prisma"
import { auth } from "../../authentication"
import { AuthError } from "../errors/auth-error"

export const updateEstimateSupplierItem = new Elysia().put(
  `/supplier/itens/estimate/update/:itemEstimateId`,
  async ({ cookie, body, params }) => {
    const { name, quantity } = body

    const user = await auth({ cookie })
    if (!user) {
      throw new AuthError("Unauthorized", "UNAUTHORIZED", 401)
    }

    const { itemEstimateId } = params

    if (!itemEstimateId) {
      throw new AuthError(
        "Item do orçamento não encontrado",
        "ITEM_NOT_FOUND",
        404
      )
    }

    const checkItemExists = await db.estimateSupplierItems.findUnique({
      where: {
        id: itemEstimateId,
      },
    })

    if (!checkItemExists) {
      throw new AuthError(
        "Item não encontrado no orçamento",
        "ESTIMATE_ITEM_NOT_FOUND",
        404
      )
    }

    const item = await db.estimateSupplierItems.update({
      where: {
        id: checkItemExists.id,
      },
      data: {
        name,
        quantity,
      },
    })

    const formattedItem = {
      ...item,
      quantity: Number(item.quantity),
    }

    return {
      message: "Item atualizado com sucesso",
      item: formattedItem,
    }
  },
  {
    body: t.Object({
      name: t.Optional(t.String()),
      quantity: t.Optional(t.Number()),
    }),
    params: t.Object({
      itemEstimateId: t.String(),
    }),
    response: {
      201: t.Object(
        {
          message: t.String(),
          item: t.Object({
            name: t.String(),
            quantity: t.Number(),
          }),
        },
        {
          description: "Item atualizado com sucesso",
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
          description: "Item não encontrado no orçamento",
        }
      ),
    },
    detail: {
      description: "Update an estimate item",
      tags: ["EstimateSupplierItem"],
    },
  }
)
