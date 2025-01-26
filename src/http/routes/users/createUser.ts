import Elysia, { t } from "elysia"
import { db } from "../../../lib/prisma"

export const createUser = new Elysia().post(
  `/me/create`,
  async ({ body }) => {
    const { name, email } = body

    const invite = await db.pendingUser.findFirst({
      where: {
        email,
      },
    })
    if (!invite) {
      const existingUser = await db.user.findFirst({
        where: {
          email,
        },
      })
      if (!existingUser) {
        const newUser = await db.user.create({
          data: {
            name,
            email,
            role: "MASTER",
            type: "basic",
          },
        })
        return {
          message: "Usuário criado com sucesso",
          user: newUser,
        }
      } else {
        return {
          message: "Usuário já cadastrado",
          user: existingUser,
        }
      }
    } else {
      const newUser = await db.user.create({
        data: {
          name,
          email,
          role: "BASIC",
          type: "basic",
          company_id: invite.company_id,
        },
      })

      await db.pendingUser.delete({ where: { email } })
      return {
        message: "Usuário criado com sucesso",
        description: "Usuário criado com sucesso",
        user: newUser,
      }
    }
  },
  {
    body: t.Object({
      name: t.String(),
      email: t.String(),
    }),
    response: {
      201: t.Object({
        message: t.String(),
        description: t.String(),
        user: t.Object({
          id: t.String(),
          name: t.String(),
          email: t.String(),
          type: t.String(),
          role: t.String(),
        }),
      }),
      400: t.Object({
        message: t.String(),
        description: t.String(),
      }),
    },
    detail: {
      description: "Create a new user",
      tags: ["User"],
    },
  }
)
