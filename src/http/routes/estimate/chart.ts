import { endOfYear, format, isSameMonth, parse, startOfYear } from "date-fns"
import { enUS, ptBR } from "date-fns/locale"
import Elysia, { t } from "elysia"
import { db } from "../../../lib/prisma"
import { auth } from "../../authentication"
import { AuthError } from "../errors/auth-error"

interface MonthlyRevenue {
  month: string
  monthTotal: number
}

export const estimateChart = new Elysia().get(
  "/estimate/chart",
  async ({ cookie }) => {
    const user = await auth({ cookie })
    if (!user) {
      throw new AuthError("Unauthorized", "UNAUTHORIZED", 401)
    }

    const hasCompany = user.Company
    if (!hasCompany) {
      throw new AuthError("Company not found", "COMPANY_NOT_FOUND", 404)
    }

    const calculateMonthlyRevenue = (
      estimates: any[],
      currentYear: number
    ): MonthlyRevenue[] => {
      const months = Array.from({ length: 12 }, (_, index) =>
        format(new Date(currentYear, index), "MMMM", {
          locale: user.country === "BR" ? ptBR : enUS,
        })
      )

      return months.map((month) => {
        const monthEstimates = estimates.filter((estimate) => {
          const estimateDate = new Date(estimate.createdAt)
          const monthDate = parse(month, "MMMM", new Date(), {
            locale: user.country === "BR" ? ptBR : enUS,
          })
          return isSameMonth(estimateDate, monthDate)
        })

        const totalRevenue = monthEstimates.reduce(
          (acc, estimate) => acc + Number(estimate.total),
          0
        )

        return {
          month,
          monthTotal: totalRevenue || 0,
        }
      })
    }

    const currentYear = new Date().getFullYear()
    const startDate = startOfYear(new Date())
    const endDate = endOfYear(new Date())

    const estimates = await db.estimate.findMany({
      select: {
        id: true,
        createdAt: true,
        status: true,
        total: true,
      },
      where: {
        AND: [
          { company_id: hasCompany.id },
          { status: "BILLED" },
          { createdAt: { gte: startDate, lte: endDate } },
        ],
      },
    })

    const filteredEstimates = estimates.filter(
      (estimate) => estimate.total !== null
    )

    const stats = calculateMonthlyRevenue(filteredEstimates, currentYear)

    return {
      message: "Contagem dos meses finalizada obtida com sucesso",
      stats,
    }
  },
  {
    response: {
      200: t.Object(
        {
          message: t.String(),
          stats: t.Array(
            t.Object({
              month: t.String(),
              monthTotal: t.Number(),
            })
          ),
        },
        {
          description: "Estatísticas dos meses obtidas com sucesso",
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
      description: "Get monthly chart statistics",
      tags: ["Estimate"],
    },
  }
)
