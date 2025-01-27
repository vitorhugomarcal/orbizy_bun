import { endOfYear, format, isSameMonth, parse, startOfYear } from "date-fns"
import { ptBR } from "date-fns/locale"
import Elysia, { t } from "elysia"
import { db } from "../../../lib/prisma"
import { auth } from "../../authentication"
import { AuthError } from "../errors/auth-error"

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

    const estimates = await db.estimate.findMany({
      select: {
        id: true,
        status: true,
        sub_total: true,
        total: true,
        createdAt: true,
      },
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

    const getMonthlyApprovedInvoices = () => {
      if (!estimates) return []

      const currentYear = new Date().getFullYear()
      const startDate = startOfYear(new Date())
      const endDate = endOfYear(new Date())

      // Filter invoices for current year and APPROVED status
      const yearEstimates = estimates.filter((estimate) => {
        const estimateDate = new Date(estimate.createdAt)
        return (
          estimateDate >= startDate &&
          estimateDate <= endDate &&
          estimate.status === "APPROVED"
        )
      })

      const months = Array.from({ length: 12 }, (_, index) => {
        return format(new Date(currentYear, index), "MMMM", { locale: ptBR })
      })

      // Calculate total revenue for each month
      const monthlyRevenue = months.map((month) => {
        const monthEstimates = yearEstimates.filter((estimate) => {
          const estimateDate = new Date(estimate.createdAt)
          const monthDate = parse(month, "MMMM", new Date(), { locale: ptBR })
          return isSameMonth(estimateDate, monthDate)
        })

        const totalRevenue = monthEstimates.reduce((acc, estimate) => {
          return acc + Number(estimate.total) // Convert cents to full currency
        }, 0)

        return {
          month,
          R$: totalRevenue,
        }
      })

      return monthlyRevenue
    }

    const chartData = getMonthlyApprovedInvoices()

    return {
      message: "Contagem dos messes finalizadas obtidas com sucesso",
      stats: chartData,
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
              R$: t.Number(),
            })
          ),
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
      description: "Get monthly chart statistics",
      tags: ["Estimate"],
    },
  }
)
