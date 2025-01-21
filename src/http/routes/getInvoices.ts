import Elysia from "elysia"
import { auth, type CookieProps } from "../authentication"
import { db } from "../../lib/prisma"

export const getInvoices = new Elysia().get(
  "/company/invoices",
  async ({ cookie }: CookieProps) => {
    const user = await auth({ cookie })
    if (!user) {
      return { error: "Unauthorized" }
    }
    const invoices = await db.invoice.findMany({
      where: {
        company_id: user.company_id,
      },
      include: {
        client: true,
      },
    })
    return invoices
  }
)
