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

    const unitDefault = await db.unitType.findMany()

    const allUnits = [...unitCustom, ...unitDefault]

    return {
      message: "Unidades encontradas com sucesso",
      description: "Unidades encontradas com sucesso",
      units: allUnits,
    }
  },
  {
    response: {
      200: t.Object({
        message: t.String(),
        description: t.String(),
        units: t.Array(
          t.Object({
            id: t.String(),
            name: t.String(),
          })
        ),
      }),
      401: t.Object({
        error: t.String(),
        description: t.String(),
      }),
    },
    detail: {
      description: "Get all units",
      tags: ["Unit"],
    },
  }
)
