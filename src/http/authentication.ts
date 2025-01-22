import { verifyToken } from "../utils/jwt"
import { db } from "../lib/prisma"

export interface CookieProps {
  cookie: {
    auth: { value: string }
  }
}
export async function auth({ cookie }: CookieProps) {
  if (!cookie) {
    return null
  }

  const payload = verifyToken(cookie)

  if (!payload) {
    return null
  }

  const user = await db.user.findUnique({
    where: { id: payload.sub },
    include: { Company: true },
  })

  return user
}
