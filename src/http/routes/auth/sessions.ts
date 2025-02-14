import Elysia, { t } from "elysia"
import { db } from "../../../lib/prisma"
import { setCookie } from "../../../utils/cookie"
import { createToken } from "../../../utils/jwt"

export const sessions = new Elysia().post(
  "/sessions",
  async ({ cookie, body }) => {
    const { email } = body as { email: string }

    const user = await db.user.findUnique({
      where: { email },
    })

    if (!user) {
      return null
    }

    console.log(user)

    const token = createToken({
      sub: user.id,
      companyId: user.company_id || "",
    })

    setCookie(cookie.auth, token)

    return {
      message: "Sessão criada com sucesso",
      token,
      user,
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
          token: t.String(),
          user: t.Object({
            id: t.String(),
            name: t.String(),
            email: t.String(),
            company_id: t.String(),
          }),
        },
        {
          description: "Sessão criada com sucesso",
        }
      ),
    },
    detail: {
      description: "Cria uma sessão para o usuário",
      tags: ["Auth"],
    },
  }
)
