import Elysia, { t } from "elysia"
import { db } from "../../../lib/prisma"
import { auth } from "../../authentication"
import { AuthError } from "../errors/auth-error"

export const monthTotal = new Elysia().get(
  "/estimate/month/total",
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

    const revenueAmount = Number(
      estimates
        .filter((estimate) => estimate.status === "APPROVED")
        .reduce((total, estimate) => total + Number(estimate.total), 0)
        .toFixed(2)
    )

    const overdueAmount = 0
    const resultAmount = revenueAmount - overdueAmount

    return {
      message: "Contagem realizada com sucesso",
      stats: resultAmount,
    }
  },
  {
    response: {
      200: t.Object(
        {
          message: t.String(),
          stats: t.Number(),
        },
        {
          description: "Estatísticas do mês obtidas com sucesso",
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
      description: "Get monthly estimates approved total statistics",
      tags: ["Estimate"],
    },
  }
)
