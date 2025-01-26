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

    await db.unitTypeCustom.delete({
      where: {
        id: unitId,
      },
    })
    return {
      message: "Unidade removida com sucesso",
      description: "Unidade removida com sucesso",
    }
  },
  {
    params: t.Object({
      unitId: t.String(),
    }),
    response: {
      204: t.Object({
        message: t.String(),
        description: t.String(),
      }),
      401: t.Object({
        error: t.String(),
        description: t.String(),
      }),
    },
    detail: {
      description: "Remove a unit",
      tags: ["Unit"],
    },
  }
)
