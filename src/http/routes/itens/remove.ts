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

    await db.item.delete({
      where: {
        id: itemId,
      },
    })
    return {
      message: "Item removido com sucesso",
      description: "Remove a item",
    }
  },
  {
    params: t.Object({
      itemId: t.String(),
    }),
    response: {
      204: t.Object({
        message: t.String(),
        description: t.String(),
      }),
      401: t.Object({
        error: t.String(),
        description: t.String(),
      }),
    },
    detail: {
      description: "Remove a item",
      tags: ["Itens"],
    },
  }
)
