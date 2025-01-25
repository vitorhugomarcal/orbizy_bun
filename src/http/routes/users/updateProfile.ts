import Elysia, { t } from "elysia"
import { db } from "../../../lib/prisma"
import { auth } from "../../authentication"
import { AuthError } from "../errors/auth-error"

export const updateUser = new Elysia().put(
  `/me/update`,
  async ({ cookie, body }) => {
    const { name } = body

    const user = await auth({ cookie })
    if (!user) {
      throw new AuthError("Unauthorized", "UNAUTHORIZED", 401)
    }

    const userUpdated = await db.user.update({
      where: {
        id: user.id,
      },
      data: {
        name,
      },
    })

    return {
      message: "Usuario atualizado com sucesso",
      userUpdated,
    }
  },
  {
    body: t.Object({
      name: t.Optional(t.String()),
    }),
  }
)
