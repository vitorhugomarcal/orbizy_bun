import Elysia, { t } from "elysia"
import { db } from "../../../lib/prisma"
import { auth } from "../../authentication"
import { AuthError } from "../errors/auth-error"

export const getByEstimate = new Elysia().get(
  "/itens/estimate/:estimateId",
  async ({ cookie, params }) => {
    const user = await auth({ cookie })
    if (!user) {
      throw new AuthError("Unauthorized", "UNAUTHORIZED", 401)
    }

    const { estimateId } = params
    if (!estimateId) {
      throw new AuthError(
        "ID do orçamento não encontrado",
        "ESTIMATE_ID_NOT_FOUND",
        404
      )
    }

    const item = await db.estimateItems.findMany({
      where: {
        estimate_id: estimateId,
      },
    })
    return item
  },
  {
    params: t.Object({
      estimateId: t.String(),
    }),
  }
)
