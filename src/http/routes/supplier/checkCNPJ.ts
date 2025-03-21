import Elysia, { t } from "elysia"
import { db } from "../../../lib/prisma"
import { auth } from "../../authentication"
import { AuthError } from "../errors/auth-error"

export const checkSupplierCNPJ = new Elysia().get(
  `/supplier/check/cnpj/:cnpj`,
  async ({ cookie, params }) => {
    const { cnpj } = params

    const user = await auth({ cookie })
    if (!user) {
      throw new AuthError("Unauthorized", "UNAUTHORIZED", 401)
    }

    const checkSupplierExists = await db.supplier.findUnique({
      where: {
        cnpj,
      },
    })

    if (checkSupplierExists) {
      return {
        message: "Supplier already exists",
      }
    } else {
      return {
        message: "Supplier not found",
      }
    }
  },
  {
    params: t.Object({
      cnpj: t.String(),
    }),
    response: {
      200: t.Object(
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
          description: "Supplier already exists",
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
    },
    detail: {
      description: "Check if Supplier exists (individual or corporate)",
      tags: ["Supplier"],
    },
  }
)
