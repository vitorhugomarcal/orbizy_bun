import { sign, verify } from "jsonwebtoken"
import { env } from "../env"

interface TokenPayload {
  sub: string
  companyId: string
}

export const createToken = (payload: TokenPayload) => {
  console.log("Criando token com payload:", payload)
  return sign(payload, env.JWT_SECRET, { expiresIn: "7d" })
}

export const verifyToken = (token: {
  jar: {
    auth: { value: string }
  }
}): TokenPayload | null => {
  console.log("Verificando token:", token)
  try {
    const tokenVerify = verify(
      token.jar.auth.value,
      env.JWT_SECRET
    ) as TokenPayload
    console.log("Token verificado:", tokenVerify)
    return tokenVerify
  } catch {
    return null
  }
}
