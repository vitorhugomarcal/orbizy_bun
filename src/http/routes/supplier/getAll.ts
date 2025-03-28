import Elysia, { t } from "elysia"
import { db } from "../../../lib/prisma"
import { auth } from "../../authentication"
import { AuthError } from "../errors/auth-error"

export const getAllSupplier = new Elysia().get(
  "/supplier/all",
  async ({ cookie }) => {
    const user = await auth({ cookie })
    if (!user) {
      throw new AuthError("Unauthorized", "UNAUTHORIZED", 401)
    }

    const hasCompany = user.Company

    if (!hasCompany) {
      throw new AuthError("Company not found", "COMPANY_NOT_FOUND", 404)
    }

    const suppliers = await db.supplier.findMany({
      include: {
        address: true,
      },
    })

    if (!suppliers) {
      throw new AuthError("Suppliers not found", "SUPPLIERS_NOT_FOUND", 404)
    }

    const formattedSuppliers = suppliers.map((supplier) => ({
      ...supplier,
      createdAt: String(supplier.createdAt),
    }))

    return {
      suppliers: formattedSuppliers,
    }
  },
  {
    response: {
      200: t.Object(
        {
          suppliers: t.Array(
            t.Object({
              id: t.String(),
              company_name: t.String(),
              cnpj: t.Nullable(t.String()),
              ein: t.Nullable(t.String()),
              phone: t.String(),
              email_address: t.Nullable(t.String()),
              createdAt: t.String(),
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
            })
          ),
        },
        {
          description: "Suppliers found successfully",
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
      404: t.Object(
        {
          message: t.String(),
        },
        {
          description: "Company not found",
        }
      ),
    },
    detail: {
      description: "Get all suppliers",
      tags: ["Supplier"],
    },
  }
)
