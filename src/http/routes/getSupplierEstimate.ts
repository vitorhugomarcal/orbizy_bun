import Elysia from "elysia"
import { auth, type CookieProps } from "../authentication"
import { db } from "../../lib/prisma"

export const getSupplierEstimate = new Elysia().get(
  "/company/suppliers/estimate",
  async ({ cookie }: CookieProps) => {
    const user = await auth({ cookie })

    if (!user) {
      return { error: "Unauthorized" }
    }

    const suppliersEstimate = await db.estimate.findMany({
      where: {
        company_id: user.Company?.id,
      },
      include: {
        estimateItems: true,
        supplier: true,
      },
    })

    return suppliersEstimate
  }
)
