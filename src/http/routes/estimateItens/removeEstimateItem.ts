import Elysia, { t } from "elysia"
import { db } from "../../../lib/prisma"
import { auth } from "../../authentication"
import { AuthError } from "../errors/auth-error"

export const removeEstimateItem = new Elysia().delete(
  `/itens/estimate/remove/:itemId`,
  async ({ cookie, params }) => {
    const user = await auth({ cookie })
    if (!user) {
      throw new AuthError("Unauthorized", "UNAUTHORIZED", 401)
    }

    const { itemId } = params

    await db.estimateItems.delete({
      where: {
        id: itemId,
      },
    })
  },
  {
    params: t.Object({
      itemId: t.String(),
    }),
  }
)
