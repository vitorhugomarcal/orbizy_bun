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
      description: "Usuario atualizado com sucesso",
      userUpdated,
    }
  },
  {
    body: t.Object({
      name: t.Optional(t.String()),
    }),
    response: {
      201: t.Object({
        message: t.String(),
        description: t.String(),
        userUpdated: t.Object({
          id: t.Optional(t.String()),
          name: t.Optional(t.String()),
          email: t.Optional(t.String()),
          company_id: t.Nullable(t.String()),
          type: t.Optional(t.String()),
          role: t.Optional(t.String()),
        }),
      }),
      401: t.Object({
        error: t.String(),
        description: t.String(),
      }),
    },
    detail: {
      description: "Update the current user's profile",
      tags: ["User"],
    },
  }
)
