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
  },
  {
    params: t.Object({
      unitId: t.String(),
    }),
  }
)
