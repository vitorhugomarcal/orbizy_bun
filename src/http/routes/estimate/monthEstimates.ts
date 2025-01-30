import Elysia, { t } from "elysia"
import { db } from "../../../lib/prisma"
import { auth } from "../../authentication"
import { AuthError } from "../errors/auth-error"

interface Estimate {
  id: string
  createdAt: string | Date
}

interface MonthlyStats {
  total: number
  percentageChange: number
}

export const monthEstimates = new Elysia().get(
  "/estimate/month",
  async ({ cookie }) => {
    const user = await auth({ cookie })
    if (!user) {
      throw new AuthError("Unauthorized", "UNAUTHORIZED", 401)
    }

    const hasCompany = user.Company

    if (!hasCompany) {
      throw new AuthError("Company not found", "COMPANY_NOT_FOUND", 404)
    }

    const estimates = await db.estimate.findMany({
      select: {
        id: true,
        createdAt: true,
      },
      where: {
        company_id: hasCompany.id,
      },
    })

    if (estimates.length) {
      return { total: 0, percentageChange: 0 }
    }

    const calculateMonthlyChange = (estimates: Estimate[]): MonthlyStats => {
      const today = new Date()
      const currentMonthStart = new Date(
        today.getFullYear(),
        today.getMonth(),
        1
      )
      const lastMonthStart = new Date(
        today.getFullYear(),
        today.getMonth() - 1,
        1
      )
      const currentMonthEnd = today
      const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0)

      const currentMonthEstimates = estimates.filter((estimate) => {
        const createdAt = new Date(estimate.createdAt)
        return createdAt >= currentMonthStart && createdAt <= currentMonthEnd
      })

      const lastMonthEstimates = estimates.filter((estimate) => {
        const createdAt = new Date(estimate.createdAt)
        return createdAt >= lastMonthStart && createdAt <= lastMonthEnd
      })

      const currentMonthCount = currentMonthEstimates.length
      const lastMonthCount = lastMonthEstimates.length

      const percentageChange =
        lastMonthCount === 0
          ? 100
          : ((currentMonthCount - lastMonthCount) / lastMonthCount) * 100

      return {
        total: currentMonthCount,
        percentageChange,
      }
    }

    const { total, percentageChange } = calculateMonthlyChange(estimates)

    if (!total || !percentageChange) {
      throw new AuthError(
        "Erro ao calcular as estatísticas do mês",
        "ERROR_CALCULATING_MONTHLY_STATS",
        500
      )
    }

    return {
      total,
      percentageChange,
    }
  },
  {
    response: {
      200: t.Object(
        {
          total: t.Number(),
          percentageChange: t.Number(),
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
      500: t.Object(
        {
          message: t.String(),
        },
        {
          description: "Erro ao calcular as estatísticas do mês",
        }
      ),
    },
    detail: {
      description: "Get monthly estimates statistics",
      tags: ["Estimate"],
    },
  }
)
