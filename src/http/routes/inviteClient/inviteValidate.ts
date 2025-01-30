import Elysia, { t } from "elysia"
import { db } from "../../../lib/prisma"
import { AuthError } from "../errors/auth-error"

const ResponseTypes = {
  200: t.Object({ message: t.String() }, { description: "Convite válido" }),
  400: t.Object(
    { message: t.String() },
    { description: "Código do convite é obrigatório" }
  ),
  429: t.Object(
    { message: t.String() },
    { description: "Por favor solicite um novo link de convite" }
  ),
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

    return {
      message: "Código de convite válido",
      isValid,
    }
  },
  {
    params: t.Object({
      code: t.String(),
    }),
    response: ResponseTypes,
    detail: {
      description: "Verifica se o código de convite é válido",
      tags: ["Invite"],
    },
  }
)
