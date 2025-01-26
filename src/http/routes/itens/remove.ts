import Elysia, { t } from "elysia"
import { db } from "../../../lib/prisma"
import { auth } from "../../authentication"
import { AuthError } from "../errors/auth-error"

export const removeItem = new Elysia().delete(
  `/itens/remove/:itemId`,
  async ({ cookie, params }) => {
    const user = await auth({ cookie })
    if (!user) {
      throw new AuthError("Unauthorized", "UNAUTHORIZED", 401)
    }

    const { itemId } = params

    if (!itemId) {
      throw new AuthError("Item não encontrado", "ITEM_NOT_FOUND", 404)
    }

    await db.item.delete({
      where: {
        id: itemId,
      },
    })
    return {
      message: "Item removido com sucesso",
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
          description: "Item removido com sucesso",
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
      description: "Remove a item",
      tags: ["Itens"],
    },
  }
)
