import Elysia, { t } from "elysia"
import { db } from "../../../lib/prisma"
import { auth } from "../../authentication"
import { AuthError } from "../errors/auth-error"

export const updateItem = new Elysia().put(
  `/itens/update/:itemId`,
  async ({ cookie, body, params }) => {
    const { name, price, description, unit, category_custom_id } = body

    const user = await auth({ cookie })
    if (!user) {
      throw new AuthError("Unauthorized", "UNAUTHORIZED", 401)
    }

    const { itemId } = params

    if (!itemId) {
      throw new AuthError("Item não encontrado", "ITEM_NOT_FOUND", 404)
    }

    const checkItemExists = await db.item.findUnique({
      where: {
        id: itemId,
      },
    })
    if (!checkItemExists) {
      throw new AuthError("Item não encontrado", "ITEM_NOT_FOUND", 404)
    }

    const item = await db.item.update({
      where: {
        id: itemId,
      },
      data: {
        name,
        price,
        description,
        unit,
        category_custom_id,
      },
    })

    const formattedItem = {
      ...item,
      price: Number(item.price),
    }

    return {
      message: "Item atualizado com sucesso",
      formattedItem,
    }
  },
  {
    body: t.Object({
      name: t.Optional(t.String()),
      price: t.Optional(t.Number()),
      description: t.Optional(t.String()),
      unit: t.Optional(t.String()),
      category_custom_id: t.Optional(t.String()),
    }),
    response: {
      201: t.Object(
        {
          message: t.String(),
          formattedItem: t.Object({
            name: t.String(),
            price: t.Number(),
            description: t.String(),
            unit: t.String(),
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
          description: "Item não encontrado",
        }
      ),
    },
    detail: {
      description: "Update a item",
      tags: ["Itens"],
    },
  }
)
