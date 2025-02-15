import Elysia, { t } from "elysia"
import { db } from "../../../lib/prisma"
import { auth } from "../../authentication"
import { AuthError } from "../errors/auth-error"

const SupplierCreateBody = t.Object({
  email_address: t.String(),
  company_name: t.String(),
  cnpj: t.String(),
  phone: t.String(),
  cep: t.String(),
  address: t.String(),
  address_number: t.String(),
  neighborhood: t.String(),
  state: t.String(),
  city: t.String(),
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

export const createSupplier = new Elysia().post(
  `/supplier/create`,
  async ({ cookie, body }) => {
    const {
      company_name,
      cnpj,
      phone,
      state,
      city,
      cep,
      address_number,
      email_address,
      address,
      neighborhood,
    } = body

    const user = await auth({ cookie })
    if (!user) {
      throw new AuthError("Não autorizado", "UNAUTHORIZED", 401)
    }

    const hasCompany = user.Company

    if (!hasCompany) {
      throw new AuthError("Empresa não encontrada", "COMPANY_NOT_FOUND", 404)
    }

    const existingSupplier = await db.supplier.findUnique({ where: { cnpj } })

    if (existingSupplier) {
      const supplierUserExists = await db.supplierUser.findUnique({
        where: {
          supplier_id_company_id: {
            supplier_id: existingSupplier.id,
            company_id: hasCompany.id,
          },
        },
      })
      if (supplierUserExists) {
        throw new AuthError(
          "Supplier is already associated with this user",
          "SUPPLIER_ALREADY_EXISTS",
          400
        )
      } else {
        await db.supplierUser.create({
          data: {
            supplier_id: existingSupplier.id,
            company_id: hasCompany.id,
          },
        })
      }
      return {
        message: "Supplier is already associated with this user",
        supplier: existingSupplier,
      }
    } else {
      const newSupplier = await db.supplier.create({
        data: {
          company_name,
          cnpj,
          phone,
          state,
          city,
          cep,
          address_number,
          email_address,
          address,
          neighborhood,
        },
      })

      await db.supplierUser.create({
        data: {
          supplier_id: newSupplier.id,
          company_id: hasCompany.id,
        },
      })
      return {
        message: "Supplier created successfully",
        supplier: newSupplier,
      }
    }
  },
  {
    body: SupplierCreateBody,
    response: ResponseTypes,
    detail: {
      description: "Create a new supplier",
      tags: ["Supplier"],
    },
  }
)
