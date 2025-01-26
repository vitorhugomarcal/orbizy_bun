import Elysia, { t } from "elysia"
import { db } from "../../../lib/prisma"
import { auth } from "../../authentication"
import { AuthError } from "../errors/auth-error"

export const getAllSupplier = new Elysia().get(
  "/supplier/company",
  async ({ cookie }) => {
    const user = await auth({ cookie })
    if (!user) {
      throw new AuthError("Unauthorized", "UNAUTHORIZED", 401)
    }

    const company = user.Company

    if (!company) {
      throw new AuthError("Company not found", "COMPANY_NOT_FOUND", 404)
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

    if (!suppliers) {
      throw new AuthError("Suppliers not found", "SUPPLIERS_NOT_FOUND", 404)
    }

    return {
      message: "Suppliers found successfully",
      suppliers,
    }
  },
  {
    response: {
      200: t.Object(
        {
          message: t.String(),
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
