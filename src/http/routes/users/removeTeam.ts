import Elysia, { t } from "elysia"
import { db } from "../../../lib/prisma"
import { auth } from "../../authentication"
import { AuthError } from "../errors/auth-error"

export const removeTeam = new Elysia().delete(
  "/team/remove/:id",
  async ({ cookie, params }) => {
    const user = await auth({ cookie })
    if (!user) {
      throw new AuthError("Unauthorized", "UNAUTHORIZED", 401)
    }

    const { id } = params

    if (!id) {
      throw new AuthError("Usuário não encontrado", "USER_NOT_FOUND", 404)
    }

    await db.user.delete({
      where: {
        id,
      },
    })

    return {
      message: "Profile removed successfully",
    }
  },
  {
    params: t.Object({
      id: t.String(),
    }),
    response: {
      200: t.Object(
        {
          message: t.String(),
        },
        {
          description: "Profile removed successfully",
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
          description: "User not found",
        }
      ),
    },
    detail: {
      description: "Remove user from team",
      tags: ["User"],
    },
  }
)
