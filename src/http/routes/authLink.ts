import Elysia, { t } from "elysia"
import { db } from "../../lib/prisma"
import { createToken } from "../../utils/jwt"
import { setCookie } from "../../utils/cookie"

export const authFromLink = new Elysia().get(
  "/auth/verify",
  async ({ query, cookie, set }) => {
    const { code, redirect } = query as { code: string; redirect: string }

    const magicLink = await db.authLinks.findUnique({
      where: { code },
      include: { user: true },
    })

    if (!magicLink || magicLink.expiresAt < new Date()) {
      set.status = 400
      return { error: "Invalid or expired magic link" }
    }

    const token = createToken({
      sub: magicLink.user.id,
      companyId: magicLink.user.company_id!,
    })

    setCookie(cookie.auth, token)

    console.log("NOVO => ", cookie.auth)
    console.log("NOVO JAR => ", cookie.jar.cookie)

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
  }
)
