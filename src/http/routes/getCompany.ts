import Elysia from "elysia"
import { auth, type CookieProps } from "../authentication"
import { db } from "../../lib/prisma"

export const getCompany = new Elysia().get(
  "/company",
  async ({ cookie }: CookieProps) => {
    const user = await auth({ cookie })

    if (!user) {
      return { error: "Unauthorized" }
    }

    const company = await db.company.findUnique({
      where: {
        id: user.Company?.id,
      },
    })
    return company
  }
)
