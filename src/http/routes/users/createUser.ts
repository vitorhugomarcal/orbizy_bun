import Elysia, { t } from "elysia"
import { db } from "../../../lib/prisma"

export const createUser = new Elysia().post(
  `/me/create`,
  async ({ body }) => {
    const { name, email, country } = body

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
            country,
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
          country,
          role: "BASIC",
          type: "basic",
          company_id: invite.company_id,
        },
      })

      await db.pendingUser.delete({ where: { email } })
      return {
        message: "Usuário criado com sucesso",
        user: newUser,
      }
    }
  },
  {
    body: t.Object({
      name: t.String(),
      email: t.String(),
      country: t.String(),
    }),
    response: {
      201: t.Object(
        {
          message: t.String(),
          user: t.Object({
            id: t.String(),
            name: t.String(),
            email: t.String(),
            country: t.String(),
            type: t.String({
              enum: ["basic", "team", "pro"],
            }),
            role: t.String({
              enum: ["MASTER", "BASIC"],
            }),
          }),
        },
        {
          description: "User created successfully",
        }
      ),
      400: t.Object(
        {
          message: t.String(),
        },
        {
          description: "User already exists",
        }
      ),
    },
    detail: {
      description: "Create a new user",
      tags: ["User"],
    },
  }
)
