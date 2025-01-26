import Elysia, { t } from "elysia"
import { db } from "../../../lib/prisma"
import { auth } from "../../authentication"
import { AuthError } from "../errors/auth-error"

export const getById = new Elysia().get(
  "/itens/:itemId",
  async ({ cookie, params }) => {
    const user = await auth({ cookie })
    if (!user) {
      throw new AuthError("Unauthorized", "UNAUTHORIZED", 401)
    }

    const { itemId } = params

    const checkItemExists = await db.item.findUnique({
      where: {
        id: itemId,
      },
    })
    if (!checkItemExists) {
      throw new AuthError("Item não encontrado", "ITEM_NOT_FOUND", 404)
    }

    const item = await db.item.findUnique({
      where: {
        id: itemId,
      },
    })

    if (!item) {
      throw new AuthError("Item não encontrado", "ITEM_NOT_FOUND", 404)
    }

    const formattedItem = {
      ...item,
      price: Number(item.price),
    }

    return {
      message: "Item encontrado",
      description: "Get a item by id",
      formattedItem,
    }
  },
  {
    params: t.Object({
      itemId: t.String(),
    }),
    response: {
      200: t.Object({
        message: t.String(),
        description: t.String(),
        formattedItem: t.Object({
          id: t.String(),
          name: t.String(),
          price: t.Number(),
          description: t.String(),
          unit: t.String(),
        }),
      }),
      401: t.Object({
        error: t.String(),
        description: t.String(),
      }),
    },
    detail: {
      description: "Get a item by id",
      tags: ["Itens"],
    },
  }
)
