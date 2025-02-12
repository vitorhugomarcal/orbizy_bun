import Elysia, { t } from "elysia"
import { db } from "../../../lib/prisma"
import { auth } from "../../authentication"
import { AuthError } from "../errors/auth-error"

export const createSupplierEstimate = new Elysia().post(
  `/supplier/estimate/create/:supplierId`,
  async ({ cookie, body, params }) => {
    const { estimate_supplier_number, status, notes } = body

    const user = await auth({ cookie })
    if (!user) {
      throw new AuthError("Unauthorized", "UNAUTHORIZED", 401)
    }

    const hasCompany = user.Company

    if (!hasCompany) {
      throw new AuthError("Company not found", "COMPANY_NOT_FOUND", 404)
    }

    const { supplierId } = params

    if (!supplierId) {
      throw new AuthError("Client ID not provided", "MISSING_CLIENT_ID", 400)
    }

    const checkSupplierExists = await db.supplier.findUnique({
      where: {
        id: supplierId,
      },
    })

    if (!checkSupplierExists) {
      throw new AuthError("Client not found", "CLIENT_NOT_FOUND", 404)
    }

    const estimate = await db.estimateSupplier.create({
      data: {
        company_id: hasCompany.id,
        supplier_id: supplierId,
        estimate_supplier_number,
        status,
        notes,
      },
    })

    return {
      message: "Orçamento cadastrado com sucesso",
      estimate: estimate,
    }
  },
  {
    body: t.Object({
      estimate_supplier_number: t.String(),
      company_id: t.String(),
      supplier_id: t.String(),
      status: t.String(),
      notes: t.String(),
    }),
    params: t.Object({
      supplierId: t.String(),
    }),
    response: {
      201: t.Object(
        {
          message: t.String(),
          estimate: t.Object({
            id: t.String(),
            company_id: t.String(),
            supplier_id: t.String(),
            estimate_supplier_number: t.String(),
            status: t.String(),
            notes: t.String(),
            createdAt: t.String(),
          }),
        },
        {
          description: "Orçamento cadastrado com sucesso",
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
          description: "Supplier not found",
        }
      ),
    },
    detail: {
      description: "Create a new estimate for supplier",
      tags: ["SupplierEstimate"],
    },
  }
)
