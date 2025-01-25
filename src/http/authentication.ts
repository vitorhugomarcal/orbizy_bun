import { db } from "../lib/prisma"
import { verifyToken } from "../utils/jwt"

export interface CookieProps {
  cookie: {
    auth?: { value: string }
  }
}
export async function auth({ cookie }: CookieProps) {
  if (!cookie?.auth?.value) {
    return null
  }

  const payload = verifyToken(cookie.auth.value)

  if (!payload) {
    return null
  }

  const user = await db.user.findUnique({
    where: { id: payload.sub },
    include: { Company: true }, // Incluindo a empresa do usuário, se existir
  })

  return user
}
