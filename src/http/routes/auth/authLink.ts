import Elysia, { t } from "elysia"
import { db } from "../../../lib/prisma"
import { setCookie } from "../../../utils/cookie"
import { createToken } from "../../../utils/jwt"

export const authFromLink = new Elysia().get(
  "/auth/verify",
  async ({ query, cookie, set }) => {
    const { code, redirect } = query as { code: string; redirect: string }

    const magicLink = await db.authLinks.findUnique({
      where: { code },
      include: { user: true },
    })

    if (!magicLink || magicLink.expiresAt < new Date()) {
      throw new Response(null, {
        status: 401,
        statusText: "Unauthorized",
      })
    }

    const token = createToken({
      sub: magicLink.user.id,
      companyId: magicLink.user.company_id!,
    })

    setCookie(cookie.auth, token)
    // Limpar magic link usado
    await db.authLinks.delete({ where: { id: magicLink.id } })

    // Redirecionar
    return new Response(null, {
      status: 302,
      headers: {
        Location: redirect,
      },
    })
  },
  {
    query: t.Object({
      code: t.String(),
      redirect: t.String(),
    }),
    response: {
      301: t.Object(
        {
          message: t.String(),
        },
        {
          description: "Redirecionado com sucesso",
        }
      ),
      401: t.Object(
        {
          message: t.String(),
        },
        {
          description: "Link inválido ou expirado",
        }
      ),
    },
    detail: {
      description: "Verifica e autentica o link de convite",
      tags: ["Auth"],
    },
  }
)
