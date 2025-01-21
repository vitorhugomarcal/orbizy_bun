import { sign, verify } from "jsonwebtoken"
import { env } from "../env"

interface TokenPayload {
  sub: string
  companyId: string
}

export const createToken = (payload: TokenPayload) => {
  return sign(payload, env.JWT_SECRET, { expiresIn: "7d" })
}

export const verifyToken = (token: {
  auth: { value: string }
}): TokenPayload | null => {
  console.log("Verificando token:", token)
  try {
    const tokenVerify = verify(token.auth.value, env.JWT_SECRET) as TokenPayload
    return tokenVerify
  } catch {
    return null
  }
}
