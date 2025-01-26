import Elysia, { t } from "elysia"
import { db } from "../../../lib/prisma"
import { auth } from "../../authentication"
import { AuthError } from "../errors/auth-error"

export const getSupplierById = new Elysia().get(
  "/supplier/company/:supplierId",
  async ({ cookie, params }) => {
    const user = await auth({ cookie })
    if (!user) {
      throw new AuthError("Unauthorized", "UNAUTHORIZED", 401)
    }

    const { supplierId } = params

    if (!supplierId) {
      throw new AuthError("Supplier ID is required", "MISSING_SUPPLIER_ID", 400)
    }

    const company = user.Company
    if (!company) {
      throw new AuthError("Company not found", "COMPANY_NOT_FOUND", 404)
    }

    const supplier = await db.supplier.findUnique({
      where: {
        id: supplierId,
      },
    })

    if (!supplier) {
      throw new AuthError("supplier not found", "SUPPLIERS_NOT_FOUND", 404)
    }

    return {
      message: "supplier found successfully",
      description: "supplier found successfully",
      supplier,
    }
  },
  {
    params: t.Object({
      supplierId: t.String(),
    }),
    response: {
      200: t.Object({
        message: t.String(),
        description: t.String(),
        supplier: t.Object({
          id: t.String(),
          company_name: t.String(),
          cnpj: t.String(),
          phone: t.String(),
          state: t.String(),
          city: t.String(),
          cep: t.String(),
          address_number: t.String(),
          email_address: t.String(),
          address: t.String(),
          neighborhood: t.String(),
        }),
      }),
      404: t.Object({
        error: t.String(),
        description: t.String(),
      }),
      400: t.Object({
        error: t.String(),
        description: t.String(),
      }),
      401: t.Object({
        error: t.String(),
        description: t.String(),
      }),
    },
    detail: {
      description: "Get supplier by ID",
      tags: ["Supplier"],
    },
  }
)
