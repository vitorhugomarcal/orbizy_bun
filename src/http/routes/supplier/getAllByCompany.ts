import Elysia, { t } from "elysia"
import { db } from "../../../lib/prisma"
import { auth } from "../../authentication"
import { AuthError } from "../errors/auth-error"

export const getAllByCompany = new Elysia().get(
  "/supplier/all/company",
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
      where: {
        supplierUser: {
          some: {
            company_id: hasCompany.id,
          },
        },
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
              cnpj: t.String(),
              phone: t.String(),
              state: t.String(),
              city: t.String(),
              cep: t.String(),
              address_number: t.String(),
              email_address: t.String(),
              address: t.String(),
              neighborhood: t.String(),
              createdAt: t.String(),
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
