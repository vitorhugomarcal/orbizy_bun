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
      include: {
        estimateSupplier: {
          include: {
            EstimateSupplierItems: true,
          },
        },
      },
    })

    if (!supplier) {
      throw new AuthError("supplier not found", "SUPPLIERS_NOT_FOUND", 404)
    }

    return {
      message: "supplier found successfully",
      supplier,
    }
  },
  {
    params: t.Object({
      supplierId: t.String(),
    }),
    response: {
      200: t.Object(
        {
          message: t.String(),
          supplier: t.Object({
            id: t.String(),
            company_name: t.String(),
            cnpj: t.Nullable(t.String()),
            ein: t.Nullable(t.String()),
            phone: t.String(),
            email_address: t.String(),
            address: t.Object({
              country: t.String(),
              state: t.String(),
              city: t.String(),
              postal_code: t.String(),
              street: t.Nullable(t.String()),
              number: t.Nullable(t.String()),
              neighborhood: t.Nullable(t.String()),
              street_address: t.Nullable(t.String()),
              unit_number: t.Nullable(t.String()),
            }),
            estimateSupplier: t.Array(
              t.Object({
                id: t.String(),
                status: t.Nullable(t.String()),
                notes: t.Nullable(t.String()),
                supplier_id: t.Nullable(t.String()),
                company_id: t.Nullable(t.String()),
                estimate_supplier_number: t.Nullable(t.String()),
                createdAt: t.Date(),
                EstimateSupplierItems: t.Array(
                  t.Object({
                    id: t.String(),
                    name: t.String(),
                    quantity: t.Number(),
                  })
                ),
              })
            ),
          }),
        },
        {
          description: "Supplier found successfully",
        }
      ),
      404: t.Object(
        {
          message: t.String(),
        },
        {
          description: "Supplier not found",
        }
      ),
      400: t.Object(
        {
          message: t.String(),
        },
        {
          description: "Supplier ID is required",
        }
      ),
      401: t.Object(
        {
          message: t.String(),
        },
        {
          description: "Unauthorized",
        }
      ),
    },
    detail: {
      description: "Get supplier by ID",
      tags: ["Supplier"],
    },
  }
)
