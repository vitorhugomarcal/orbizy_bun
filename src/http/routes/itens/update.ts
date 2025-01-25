import Elysia, { t } from "elysia"
import { db } from "../../../lib/prisma"
import { auth } from "../../authentication"
import { AuthError } from "../errors/auth-error"

export const updateItem = new Elysia().put(
  `/itens/update/:itemId`,
  async ({ cookie, body, params }) => {
    const { name, price, description, unit } = body

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

    const item = await db.item.update({
      where: {
        id: itemId,
      },
      data: {
        name,
        price,
        description,
        unit,
      },
    })

    return {
      message: "Item atualizado com sucesso",
      item,
    }
  },
  {
    body: t.Object({
      name: t.Optional(t.String()),
      price: t.Optional(t.Number()),
      description: t.Optional(t.String()),
      unit: t.Optional(t.String()),
    }),
  }
)
