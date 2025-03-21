import Elysia, { t } from "elysia"
import { db } from "../../../lib/prisma"
import { auth } from "../../authentication"
import { AuthError } from "../errors/auth-error"

export const updateSupplier = new Elysia().put(
  `/supplier/update/:supplierId`,
  async ({ cookie, body, params }) => {
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
      throw new AuthError("Unauthorized", "UNAUTHORIZED", 401)
    }

    const { supplierId } = params

    if (!supplierId) {
      throw new AuthError("Supplier ID is required", "MISSING_SUPPLIER_ID", 400)
    }

    const supplier = await db.supplier.findUnique({
      where: {
        id: supplierId,
      },
    })
    if (!supplier) {
      throw new AuthError("Supplier not found", "SUPPLIER_NOT_FOUND", 404)
    }

    await db.address.update({
      where: {
        id: supplier.address_id,
      },
      data: {
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
    })

    const updatedSuppler = await db.supplier.update({
      where: {
        id: supplierId,
      },
      data: {
        cnpj,
        ein,
        phone,
        company_name,
        email_address,
      },
    })

    return {
      message: "Supplier updated successfully",
      supplier: updatedSuppler,
    }
  },
  {
    body: t.Object({
      cnpj: t.Optional(t.String()),
      ein: t.Optional(t.String()),
      phone: t.Optional(t.String()),
      company_name: t.Optional(t.String()),
      email_address: t.Optional(t.String()),
      country: t.Optional(t.String()),
      state: t.Optional(t.String()),
      city: t.Optional(t.String()),
      postal_code: t.Optional(t.String()),
      street: t.Optional(t.String()),
      number: t.Optional(t.String()),
      neighborhood: t.Optional(t.String()),
      street_address: t.Optional(t.String()),
      unit_number: t.Optional(t.String()),
    }),
    response: {
      201: t.Object(
        {
          message: t.String(),
          supplier: t.Object({
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
          }),
        },
        {
          description: "Supplier updated successfully",
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
      400: t.Object(
        {
          message: t.String(),
        },
        {
          description: "Supplier is already associated with this user",
        }
      ),
    },
    detail: {
      description: "Update a supplier",
      tags: ["Supplier"],
    },
  }
)
