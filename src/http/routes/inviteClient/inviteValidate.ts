import Elysia, { t } from "elysia"
import { db } from "../../../lib/prisma"
import { AuthError } from "../errors/auth-error"

export const inviteValidate = new Elysia().get(
  `/invite/validate/:code`,
  async ({ params }) => {
    const { code } = params
    if (!code) {
      throw new AuthError(
        "Código de convite é obrigatório",
        "MISSING_CODE",
        400
      )
    }

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
    response: {
      200: t.Object(
        {
          message: t.String(),
          isValid: t.Boolean(),
        },
        {
          description: "Código de convite válido",
        }
      ),
      400: t.Object(
        {
          message: t.String(),
        },
        {
          description: "Código de convite inválido",
        }
      ),
      429: t.Object(
        {
          message: t.String(),
        },
        {
          description: "Solicite um novo link de convite",
        }
      ),
    },
    detail: {
      description: "Verifica se o código de convite é válido",
      tags: ["Invite"],
    },
  }
)
