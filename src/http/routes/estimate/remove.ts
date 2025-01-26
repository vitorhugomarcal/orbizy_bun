import Elysia, { t } from "elysia"
import { db } from "../../../lib/prisma"
import { auth } from "../../authentication"
import { AuthError } from "../errors/auth-error"

export const removeEstimate = new Elysia().delete(
  `/estimate/remove/:estimateId`,
  async ({ cookie, params }) => {
    const user = await auth({ cookie })
    if (!user) {
      throw new AuthError("Unauthorized", "UNAUTHORIZED", 401)
    }

    const { estimateId } = params

    await db.estimate.delete({
      where: {
        id: estimateId,
      },
    })

    return {
      message: "Estimate removed successfully",
    }
  },
  {
    params: t.Object({
      estimateId: t.String(),
    }),
    response: {
      204: t.Object({
        message: t.String(),
      }),
      401: t.Object({
        error: t.String(),
      }),
    },
    detail: {
      description: "Remove a estimate",
      tags: ["Estimate"],
    },
  }
)
