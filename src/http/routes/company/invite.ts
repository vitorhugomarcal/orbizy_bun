import Elysia, { t } from "elysia"
import { db } from "../../../lib/prisma"
import { auth } from "../../authentication"
import { AuthError } from "../errors/auth-error"

export const inviteToCompany = new Elysia().post(
  `/company/invite`,
  async ({ cookie, body }) => {
    const { email } = body

    const user = await auth({ cookie })
    if (!user) {
      throw new AuthError("Unauthorized", "UNAUTHORIZED", 401)
    }

    const existingInvite = await db.pendingUser.findUnique({
      where: {
        email,
      },
    })
    if (existingInvite) {
      throw new Error("Usuário já foi convidado.")
    }

    const invitedUser = await db.pendingUser.create({
      data: {
        email,
        company_id: user.company_id!,
        invited_by: user.id,
      },
    })

    return {
      message: "Cliente cadastrado com sucesso",
      invitedUser,
    }
  },
  {
    body: t.Object({
      email: t.String(),
    }),
    response: {
      201: t.Object(
        {
          message: t.String(),
          invitedUser: t.Object({
            id: t.String(),
            email: t.String(),
            company_id: t.String(),
            invited_by: t.String(),
          }),
        },
        {
          description: "Usuário convidado com sucesso",
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
      description: "Register a new member to Team",
      tags: ["Company"],
    },
  }
)
