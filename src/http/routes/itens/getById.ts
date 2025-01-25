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
    return item
  },
  {
    params: t.Object({
      itemId: t.String(),
    }),
  }
)
