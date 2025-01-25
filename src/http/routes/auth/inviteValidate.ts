import Elysia, { t } from "elysia"
import { db } from "../../../lib/prisma"
import { AuthError } from "../errors/auth-error"

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
