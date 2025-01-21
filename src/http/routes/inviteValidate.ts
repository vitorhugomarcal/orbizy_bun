import Elysia, { t } from "elysia"
import { db } from "../../lib/prisma"
import { createId } from "@paralleldrive/cuid2"
import { env } from "../../env"

class AuthError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number
  ) {
    super(message)
    this.name = "AuthError"
  }
}

export const inviteValidate = new Elysia().get(
  `/invite/validate/:code`,
  async ({ params }) => {
    const { code } = params

    const isValid = await db.inviteLinks.findFirst({
      where: {
        code,
      },
    })

    if (!isValid) {
      throw new AuthError(
        "Por favor solicite um novo link de convite",
        "RATE_LIMITED",
        429
      )
    }

    return isValid
  },
  {
    params: t.Object({
      code: t.String(),
    }),
  }
)
