import Elysia from "elysia"
import { db } from "../../../lib/prisma"
import { auth, type CookieProps } from "../../authentication"

export const getEstimates = new Elysia().get(
  "/company/estimates",
  async ({ cookie }: CookieProps) => {
    const user = await auth({ cookie })
    if (!user) {
      return { error: "Unauthorized" }
    }
    const estimates = await db.estimate.findMany({
      where: {
        company_id: user.company_id,
      },
    })
    return estimates
  }
)
