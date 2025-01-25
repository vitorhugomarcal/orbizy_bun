import Elysia from "elysia"
import { db } from "../../../lib/prisma"
import { auth } from "../../authentication"
import { AuthError } from "../errors/auth-error"

export const getEstimates = new Elysia().get(
  "/estimate",
  async ({ cookie }) => {
    const user = await auth({ cookie })
    if (!user) {
      throw new AuthError("Unauthorized", "UNAUTHORIZED", 401)
    }
    const estimates = await db.estimate.findMany({
      where: {
        company_id: user.company_id,
      },
    })
    return estimates
  }
)
