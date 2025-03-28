import Elysia, { t } from "elysia"
import { db } from "../../../lib/prisma"
import { auth } from "../../authentication"
import { AuthError } from "../errors/auth-error"

const SupplierCreateBody = t.Object({
  ein: t.Nullable(t.String()),
  cnpj: t.Nullable(t.String()),
  company_name: t.String(),
  email_address: t.Nullable(t.String()),
  phone: t.String(),
  address: t.Object({
    country: t.String(),
    city: t.String(),
    state: t.String(),
    postal_code: t.String(),
    street: t.Nullable(t.String()),
    number: t.Nullable(t.String()),
    neighborhood: t.Nullable(t.String()),
    street_address: t.Nullable(t.String()),
    unit_number: t.Nullable(t.String()),
  }),
})

const ResponseTypes = {
  201: t.Object(
    { message: t.String(), supplier: t.Any() },
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
      ein,
      cnpj,
      company_name,
      email_address,
      phone,
      address: {
        country,
        city,
        state,
        postal_code,
        street,
        number,
        neighborhood,
        street_address,
        unit_number,
      },
    } = body

    const user = await auth({ cookie })
    if (!user) {
      throw new AuthError("Não autorizado", "UNAUTHORIZED", 401)
    }

    const hasCompany = user.Company

    if (!hasCompany) {
      throw new AuthError("Empresa não encontrada", "COMPANY_NOT_FOUND", 404)
    }

    if (!ein && !cnpj) {
      throw new AuthError(
        "É necessário fornecer CNPJ ou EIN",
        "MISSING_IDENTIFIER",
        400
      )
    }

    let existingSupplier = null
    if (cnpj) {
      existingSupplier = await db.supplier.findFirst({ where: { cnpj } })
    } else if (ein) {
      existingSupplier = await db.supplier.findFirst({ where: { ein } })
    }

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
        return {
          message: "Fornecedor já está associado a este usuário",
          supplier: existingSupplier,
        }
      } else {
        await db.supplierUser.create({
          data: {
            supplier_id: existingSupplier.id,
            company_id: hasCompany.id,
          },
        })
        return {
          message: "Fornecedor existente associado com sucesso",
          supplier: existingSupplier,
        }
      }
    } else {
      const address = await db.address.create({
        data: {
          country,
          state,
          city,
          postal_code,
          street,
          number,
          neighborhood,
          street_address,
          unit_number,
        },
      })

      const newSupplier = await db.supplier.create({
        data: {
          company_name,
          email_address,
          cnpj,
          ein,
          phone,
          address_id: address.id,
        },
      })

      await db.supplierUser.create({
        data: {
          supplier_id: newSupplier.id,
          company_id: hasCompany.id,
        },
      })

      return {
        message: "Fornecedor criado com sucesso",
        supplier: newSupplier,
      }
    }
  },
  {
    body: SupplierCreateBody,
    response: ResponseTypes,
    detail: {
      description: "Criar um novo fornecedor",
      tags: ["Supplier"],
    },
  }
)
