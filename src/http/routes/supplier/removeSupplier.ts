import Elysia, { t } from "elysia"
import { db } from "../../../lib/prisma"
import { auth } from "../../authentication"
import { AuthError } from "../errors/auth-error"

export const removeSupplier = new Elysia().delete(
  `/supplier/remove/:supplierId`,
  async ({ cookie, params }) => {
    const user = await auth({ cookie })
    if (!user) {
      throw new AuthError("Unauthorized", "UNAUTHORIZED", 401)
    }

    const { supplierId } = params

    if (!supplierId || !user.company_id) {
      throw new AuthError(
        "Supplier ID and Company ID is required",
        "MISSING_SUPPLIER_AND_COMPANY_ID",
        400
      )
    }

    const deleteAssociation = await db.supplierUser.delete({
      where: {
        supplier_id_company_id: {
          supplier_id: supplierId,
          company_id: user.company_id,
        },
      },
    })

    if (!deleteAssociation) {
      throw new AuthError(
        "Supplier not found or not associated with this user",
        "SUPPLIER_NOT_FOUND",
        404
      )
    }

    return {
      message: "Supplier removed successfully",
    }
  },
  {
    params: t.Object({
      supplierId: t.String(),
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
      description: "Remove a supplier",
      tags: ["Supplier"],
    },
  }
)
