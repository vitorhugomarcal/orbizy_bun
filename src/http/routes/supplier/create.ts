import Elysia, { t } from "elysia"
import { db } from "../../../lib/prisma"
import { auth } from "../../authentication"
import { AuthError } from "../errors/auth-error"

const SupplierCreateBody = t.Object({
  email_address: t.String(),
  company_name: t.String(),
  cnpj: t.Nullable(t.String()),
  ein: t.Nullable(t.String()),
  phone: t.String(),
  country: t.String(),
  state: t.String(),
  city: t.String(),
  postal_code: t.String(),
  street: t.Nullable(t.String()),
  number: t.Nullable(t.String()),
  neighborhood: t.Nullable(t.String()),
  street_address: t.Nullable(t.String()),
  unit_number: t.Nullable(t.String()),
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
      cnpj,
      ein,
      phone,
      company_name,
      email_address,
      country,
      state,
      city,
      postal_code,
      street,
      number,
      neighborhood,
      street_address,
      unit_number,
    } = body

    const user = await auth({ cookie })
    if (!user) {
      throw new AuthError("Não autorizado", "UNAUTHORIZED", 401)
    }

    const hasCompany = user.Company

    if (!hasCompany) {
      throw new AuthError("Empresa não encontrada", "COMPANY_NOT_FOUND", 404)
    }

    const existingSupplierCNPJ = await db.supplier.findFirst({
      where: { cnpj },
    })

    const existingSupplierEIN = await db.supplier.findFirst({ where: { ein } })

    if (!existingSupplierCNPJ || !existingSupplierEIN) {
      throw new AuthError(
        "Supplier with this CNPJ already exists",
        "SUPPLIER_ALREADY_EXISTS",
        400
      )
    }

    if (existingSupplierCNPJ || existingSupplierEIN) {
      const supplierUserExists = await db.supplierUser.findUnique({
        where: {
          supplier_id_company_id: {
            supplier_id: existingSupplierCNPJ.id || existingSupplierEIN.id,
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
            supplier_id: existingSupplierCNPJ.id || existingSupplierEIN.id,
            company_id: hasCompany.id,
          },
        })
      }
      return {
        message: "Supplier is already associated with this user",
        supplier: existingSupplierCNPJ,
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
          email_address,
          company_name,
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
