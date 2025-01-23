import Elysia, { t } from "elysia"
import { db } from "../../../lib/prisma"
import { setCookie } from "../../../utils/cookie"
import { createToken } from "../../../utils/jwt"

export const sessions = new Elysia().post(
  "/sessions",
  async ({ cookie, set, body }) => {
    const { email } = body as { email: string }

    const user = await db.user.findUnique({
      where: { email },
    })

    if (!user) {
      return null
    }

    const token = createToken({
      sub: user.id,
      companyId: user.company_id || "",
    })

    setCookie(cookie.auth, token)

    return (set.status = 200)
  },
  {
    body: t.Object({
      email: t.String(),
    }),
  }
)
