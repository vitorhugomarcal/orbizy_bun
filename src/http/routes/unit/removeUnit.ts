import Elysia, { t } from "elysia"
import { db } from "../../../lib/prisma"
import { auth } from "../../authentication"
import { AuthError } from "../errors/auth-error"

export const removeUnit = new Elysia().delete(
  `/unit/remove/:unitId`,
  async ({ cookie, params }) => {
    const user = await auth({ cookie })
    if (!user) {
      throw new AuthError("Unauthorized", "UNAUTHORIZED", 401)
    }

    const { unitId } = params

    if (!unitId) {
      throw new AuthError("Unit ID is required", "MISSING_UNIT_ID", 400)
    }

    await db.unitTypeCustom.delete({
      where: {
        id: unitId,
      },
    })
    return {
      message: "Unidade removida com sucesso",
    }
  },
  {
    params: t.Object({
      unitId: t.String(),
    }),
    response: {
      204: t.Object(
        {
          message: t.String(),
        },
        {
          description: "Unit removed successfully",
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
    },
    detail: {
      description: "Remove a unit",
      tags: ["Unit"],
    },
  }
)
