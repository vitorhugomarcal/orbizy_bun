import Elysia, { t } from "elysia"
import { db } from "../../../lib/prisma"
import { auth } from "../../authentication"
import { AuthError } from "../errors/auth-error"

export const getUnits = new Elysia().get(
  "/units",
  async ({ cookie }) => {
    const user = await auth({ cookie })
    if (!user) {
      throw new AuthError("Unauthorized", "UNAUTHORIZED", 401)
    }

    const unitCustom = await db.unitTypeCustom.findMany({
      where: {
        company_id: user.company_id,
      },
    })

    if (!unitCustom) {
      throw new AuthError(
        "Unidades customizadas não encontradas",
        "CUSTOM_UNITS_NOT_FOUND",
        404
      )
    }

    const unitDefault = await db.unitType.findMany()

    if (!unitDefault) {
      throw new AuthError(
        "Unidades padrão não encontradas",
        "DEFAULT_UNITS_NOT_FOUND",
        404
      )
    }

    const allUnits = [...unitCustom, ...unitDefault]

    return {
      message: "Unidades encontradas com sucesso",
      units: allUnits,
    }
  },
  {
    response: {
      200: t.Object(
        {
          message: t.String(),
          units: t.Array(
            t.Object({
              id: t.String(),
              name: t.String(),
              company_id: t.Optional(t.String()),
            })
          ),
        },
        {
          description: "Units retrieved successfully",
        }
      ),
      401: t.Object(
        {
          message: t.String(),
        },
        {
          description: "Unauthorized",
        }
      ),
      404: t.Object(
        {
          message: t.String(),
        },
        {
          description: "Not found",
        }
      ),
    },
    detail: {
      description: "Get all units",
      tags: ["Unit"],
    },
  }
)
