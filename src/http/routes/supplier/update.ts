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

    return {
      message: "Supplier updated successfully",
      supplier: updatedSuppler,
    }
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
