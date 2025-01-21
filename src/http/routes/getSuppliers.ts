import Elysia from "elysia"
import { auth, type CookieProps } from "../authentication"
import { db } from "../../lib/prisma"

export const getSuppliers = new Elysia().get(
  "/company/suppliers",
  async ({ cookie }: CookieProps) => {
    const user = await auth({ cookie })

    if (!user) {
      return { error: "Unauthorized" }
    }

    const suppliers = await db.supplier.findMany({
      where: {
        supplierUser: {
          some: {
            company_id: user.Company?.id,
          },
        },
      },
    })

    return suppliers
  }
)
