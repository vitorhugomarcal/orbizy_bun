import Elysia, { t } from "elysia"
import { db } from "../../../lib/prisma"
import { auth } from "../../authentication"
import { AuthError } from "../errors/auth-error"

export const getAllEstimates = new Elysia().get(
  "/estimate",
  async ({ cookie }) => {
    const user = await auth({ cookie })
    if (!user) {
      throw new AuthError("Unauthorized", "UNAUTHORIZED", 401)
    }

    const hasCompany = user.Company

    if (!hasCompany) {
      throw new AuthError("Company not found", "COMPANY_NOT_FOUND", 404)
    }

    const estimates = await db.estimateClient.findMany({
      where: {
        company_id: hasCompany.id,
      },
    })

    if (!estimates) {
      throw new AuthError(
        "Orçamentos não encontrados",
        "ESTIMATES_NOT_FOUND",
        404
      )
    }

    const formattedEstimates = estimates.map((estimate) => {
      return {
        ...estimate,
        sub_total: Number(estimate.sub_total),
        total: Number(estimate.total),
      }
    })
    return {
      message: "Orçamentos encontrados",
      estimates: formattedEstimates,
    }
  },
  {
    response: {
      200: t.Object(
        {
          message: t.String(),
          estimates: t.Array(
            t.Object({
              estimate_number: t.String(),
              status: t.String(),
              notes: t.String(),
              sub_total: t.Number(),
              total: t.Number(),
              client_id: t.String(),
              createdAt: t.String(),
            })
          ),
        },
        {
          description: "Orçamentos encontrados",
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
          description: "Orçamentos não encontrados",
        }
      ),
    },
    detail: {
      description: "Get all estimates",
      tags: ["Estimate"],
    },
  }
)
