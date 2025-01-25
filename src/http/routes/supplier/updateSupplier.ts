import Elysia, { t } from "elysia"
import { db } from "../../../lib/prisma"
import { auth } from "../../authentication"
import { AuthError } from "../errors/auth-error"

export const updateSupplier = new Elysia().put(
  `/supplier/update/:supplierId`,
  async ({ cookie, body, params }) => {
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

    const { supplierId } = params

    const supplier = await db.supplier.findUnique({
      where: {
        id: supplierId,
      },
    })
    if (!supplier) {
      throw new AuthError("Supplier not found", "SUPPLIER_NOT_FOUND", 404)
    }

    const updatedSuppler = await db.supplier.update({
      where: {
        id: supplierId,
      },
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

    return updatedSuppler
  },
  {
    body: t.Object({
      company_name: t.Optional(t.String()),
      cnpj: t.Optional(t.String()),
      phone: t.Optional(t.String()),
      state: t.Optional(t.String()),
      city: t.Optional(t.String()),
      cep: t.Optional(t.String()),
      address_number: t.Optional(t.String()),
      email_address: t.Optional(t.String()),
      address: t.Optional(t.String()),
      neighborhood: t.Optional(t.String()),
    }),
  }
)
