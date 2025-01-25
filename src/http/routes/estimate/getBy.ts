import Elysia, { t } from "elysia"
import { db } from "../../../lib/prisma"
import { auth } from "../../authentication"
import { AuthError } from "../errors/auth-error"

export const getByEstimate = new Elysia().get(
  `/estimate/:estimateId`,
  async ({ cookie, params }) => {
    const user = await auth({ cookie })
    if (!user) {
      throw new AuthError("Unauthorized", "UNAUTHORIZED", 401)
    }

    const { estimateId } = params

    const estimate = await db.estimate.findUnique({
      where: {
        id: estimateId,
      },
    })
    return estimate
  },
  {
    params: t.Object({
      estimateId: t.String(),
    }),
  }
)
