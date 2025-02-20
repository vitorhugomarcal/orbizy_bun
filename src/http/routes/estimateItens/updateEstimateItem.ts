import Elysia, { t } from "elysia"
import { db } from "../../../lib/prisma"
import { auth } from "../../authentication"
import { AuthError } from "../errors/auth-error"

export const updateEstimateItem = new Elysia().put(
  `/itens/estimate/update/:itemInvoiceId`,
  async ({ cookie, body, params }) => {
    const { name, quantity, price, unit, total } = body

    const user = await auth({ cookie })
    if (!user) {
      throw new AuthError("Unauthorized", "UNAUTHORIZED", 401)
    }

    const { itemInvoiceId } = params

    if (!itemInvoiceId) {
      throw new AuthError(
        "Item do orçamento não encontrado",
        "ITEM_NOT_FOUND",
        404
      )
    }

    const checkItemExists = await db.estimateItems.findUnique({
      where: {
        id: itemInvoiceId,
      },
    })

    if (!checkItemExists) {
      throw new AuthError(
        "Item não encontrado no orçamento",
        "ESTIMATE_ITEM_NOT_FOUND",
        404
      )
    }

    const item = await db.estimateItems.update({
      where: {
        id: checkItemExists.id,
      },
      data: {
        name,
        quantity,
        price,
        unit,
        total,
      },
    })

    const formattedItem = {
      ...item,
      quantity: Number(item.quantity),
      price: Number(item.price),
      total: Number(item.total),
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
      price: t.Optional(t.Number()),
      unit: t.Optional(t.String()),
      total: t.Optional(t.Number()),
    }),
    params: t.Object({
      itemInvoiceId: t.String(),
    }),
    response: {
      201: t.Object(
        {
          message: t.String(),
          item: t.Object({
            name: t.String(),
            quantity: t.Number(),
            price: t.Number(),
            unit: t.String(),
            total: t.Number(),
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
      tags: ["EstimateItem"],
    },
  }
)
