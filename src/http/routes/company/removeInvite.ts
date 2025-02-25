import Elysia, { t } from "elysia"
import { db } from "../../../lib/prisma"
import { auth } from "../../authentication"
import { AuthError } from "../errors/auth-error"

export const removeInviteToCompany = new Elysia().delete(
  `/company/invite/remove/:id`,
  async ({ cookie, params }) => {
    const { id } = params

    const user = await auth({ cookie })
    if (!user) {
      throw new AuthError("Unauthorized", "UNAUTHORIZED", 401)
    }

    await db.pendingUser.delete({
      where: {
        id,
      },
    })

    return {
      message: "Usuário removido com sucesso",
    }
  },
  {
    params: t.Object({
      id: t.String(),
    }),
    response: {
      201: t.Object(
        {
          message: t.String(),
        },
        {
          description: "Convite removido com sucesso",
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
      description: "Remove a invited member to Team",
      tags: ["Company"],
    },
  }
)
