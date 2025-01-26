import Elysia, { t } from "elysia"
import { db } from "../../../lib/prisma"
import { auth } from "../../authentication"
import { AuthError } from "../errors/auth-error"

export const createSupplier = new Elysia().post(
  `/supplier/register`,
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
      throw new AuthError("Unauthorized", "UNAUTHORIZED", 401)
    }

    const existingSupplier = await db.supplier.findUnique({ where: { cnpj } })

    const company = user.Company
    if (!company) {
      throw new AuthError("Unauthorized", "UNAUTHORIZED", 401)
    }

    if (existingSupplier) {
      const supplierUserExists = await db.supplierUser.findUnique({
        where: {
          supplier_id_company_id: {
            supplier_id: existingSupplier.id,
            company_id: company.id,
          },
        },
      })
      if (supplierUserExists) {
        throw new AuthError(
          "Supplier is already associated with this user",
          "SUPPLIER_ALREADY_EXISTS",
          400
        )
      }
      await db.supplierUser.create({
        data: {
          supplier_id: existingSupplier.id,
          company_id: company.id,
        },
      })
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
          company_id: company.id,
        },
      })
      return {
        message: "Supplier created successfully",
        description: "Supplier created successfully",
        supplier: newSupplier,
      }
    }
  },
  {
    body: t.Object({
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
    }),
    response: {
      201: t.Object({
        message: t.String(),
        description: t.String(),
        supplier: t.Object({
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
        }),
      }),
      401: t.Object({
        error: t.String(),
        description: t.String(),
      }),
    },
    detail: {
      description: "Create a new supplier",
      tags: ["Supplier"],
    },
  }
)
