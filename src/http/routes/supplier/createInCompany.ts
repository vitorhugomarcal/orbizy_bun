import Elysia, { t } from "elysia"
import { db } from "../../../lib/prisma"
import { auth } from "../../authentication"
import { AuthError } from "../errors/auth-error"

const SupplierCreateParams = t.Object({
  supplierId: t.String(),
})

const ResponseTypes = {
  201: t.Object(
    { message: t.String() },
    { description: "Fornecedor criado com sucesso" }
  ),
  400: t.Object(
    { message: t.String() },
    { description: "Dados inválidos ou fornecedor já existe" }
  ),
  401: t.Object({ message: t.String() }, { description: "Não autorizado" }),
  404: t.Object(
    { message: t.String() },
    { description: "Empresa não encontrada" }
  ),
}

export const createInCompany = new Elysia().post(
  "/supplier/create-in-company/:supplierId",
  async ({ cookie, params }) => {
    const user = await auth({ cookie })
    if (!user) {
      throw new AuthError("Não autorizado", "UNAUTHORIZED", 401)
    }

    const { supplierId } = params

    if (!supplierId) {
      throw new AuthError(
        "Supplier ID is required",
        "SUPPLIER_ID_REQUIRED",
        400
      )
    }

    const hasCompany = user.Company
    if (!hasCompany) {
      throw new AuthError("Company not found", "COMPANY_NOT_FOUND", 404)
    }

    const existingSupplier = await db.supplier.findUnique({
      where: {
        id: supplierId,
      },
    })

    if (!existingSupplier) {
      throw new AuthError("Supplier not found", "SUPPLIER_NOT_FOUND", 404)
    }

    const existingAssociation = await db.supplierUser.findUnique({
      where: {
        supplier_id_company_id: {
          supplier_id: supplierId,
          company_id: hasCompany.id,
        },
      },
    })

    if (existingAssociation) {
      throw new AuthError(
        "Supplier is already associated with this user",
        "SUPPLIER_ALREADY_ASSOCIATED",
        400
      )
    }

    await db.supplierUser.create({
      data: {
        supplier_id: supplierId,
        company_id: hasCompany.id,
      },
    })

    return {
      message: "Supplier associated with company successfully",
    }
  },
  {
    params: SupplierCreateParams,
    response: ResponseTypes,
    detail: {
      description: "Criar fornecedor na empresa",
      tags: ["Supplier"],
    },
  }
)
