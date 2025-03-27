import Elysia, { t } from "elysia"
import { db } from "../../../lib/prisma"
import { auth } from "../../authentication"
import { AuthError } from "../errors/auth-error"

export const getPayments = new Elysia().get(
  "/payments",
  async ({ cookie }) => {
    const user = await auth({ cookie })
    if (!user) {
      throw new AuthError("Unauthorized", "UNAUTHORIZED", 401)
    }

    const hasCompany = user.Company

    if (!hasCompany) {
      throw new AuthError("Company not found", "COMPANY_NOT_FOUND", 404)
    }

    const payments = await db.paymentModeCustom.findMany({
      where: {
        company_id: hasCompany.id,
      },
    })
    if (!payments) {
      throw new AuthError("Payments not found", "Payments_NOT_FOUND", 404)
    }

    return {
      message: "Payments found successfully",
      payments,
    }
  },
  {
    response: {
      200: t.Object(
        {
          message: t.String(),
          payments: t.Array(
            t.Object({
              id: t.String(),
              name: t.String(),
              type: t.String(),
              code: t.String(),
            })
          ),
        },
        {
          description: "Itens found successfully",
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
          description: "Payments not found",
        }
      ),
    },
    detail: {
      description: "Get all payments",
      tags: ["Payment"],
    },
  }
)
