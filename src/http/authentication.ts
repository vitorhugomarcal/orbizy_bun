// authentication.ts
import { PrismaClient } from "@prisma/client"
import { verifyToken } from "../utils/jwt"
import { db } from "../lib/prisma"

export interface CookieProps {
  cookie: {
    jar: {
      auth: { value: string }
    }
  }
}
export async function auth({ cookie }: CookieProps) {
  console.log("Cookie recebido:", cookie)

  if (!cookie) {
    console.log("Nenhum cookie auth encontrado")
    return null
  }

  // 2. Log do token
  const payload = verifyToken(cookie)
  console.log("Payload do token:", payload)

  if (!payload) {
    console.log("Token inválido")
    return null
  }

  // 3. Log da busca do usuário
  const user = await db.user.findUnique({
    where: { id: payload.sub },
    include: { Company: true },
  })
  console.log("Usuário encontrado:", user)

  return user
}
