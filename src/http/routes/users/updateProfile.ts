import Elysia, { t } from "elysia"
import { db } from "../../../lib/prisma"
import { auth } from "../../authentication"
import { AuthError } from "../errors/auth-error"

export const updateUser = new Elysia().put(
  `/me/update`,
  async ({ cookie, body }) => {
    const { name, country } = body

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
        country,
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
      country: t.Optional(t.String()),
    }),
    response: {
      201: t.Object(
        {
          message: t.String(),
          userUpdated: t.Object({
            id: t.String(),
            name: t.String(),
            email: t.String(),
            country: t.String(),
            company_id: t.String(),
            type: t.String({
              enum: ["basic", "team", "pro"],
            }),
            role: t.String({
              enum: ["MASTER", "BASIC"],
            }),
          }),
        },
        {
          description: "User updated successfully",
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
    },
    detail: {
      description: "Update the current user's profile",
      tags: ["User"],
    },
  }
)
