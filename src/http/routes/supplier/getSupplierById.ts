import Elysia, { t } from "elysia"
import { db } from "../../../lib/prisma"
import { auth } from "../../authentication"
import { AuthError } from "../errors/auth-error"

export const getSupplierById = new Elysia().get(
  "/supplier/company/:supplierId",
  async ({ cookie, params }) => {
    const user = await auth({ cookie })

    if (!user) {
      return { error: "Unauthorized" }
    }
    const { supplierId } = params

    if (!supplierId) {
      throw new AuthError("Supplier ID is required", "MISSING_SUPPLIER_ID", 400)
    }

    const company = user.Company
    if (!company) {
      throw new AuthError("Company not found", "COMPANY_NOT_FOUND", 401)
    }

    const suppliers = await db.supplier.findMany({
      where: {
        supplierUser: {
          some: {
            company_id: company.id,
          },
        },
      },
    })
    return suppliers
  },
  {
    params: t.Object({
      supplierId: t.String(),
    }),
  }
)
