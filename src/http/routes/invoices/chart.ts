import { endOfYear, format, isSameMonth, parse, startOfYear } from "date-fns"
import { ptBR } from "date-fns/locale"
import Elysia, { t } from "elysia"
import { db } from "../../../lib/prisma"
import { auth } from "../../authentication"
import { AuthError } from "../errors/auth-error"

interface MonthlyRevenue {
  month: string
  monthTotal: number
}

const calculateMonthlyRevenue = (
  invoices: any[],
  currentYear: number
): MonthlyRevenue[] => {
  const months = Array.from({ length: 12 }, (_, index) =>
    format(new Date(currentYear, index), "MMMM", { locale: ptBR })
  )

  return months.map((month) => {
    const monthInvoices = invoices.filter((invoice) => {
      const invoiceDate = new Date(invoice.createdAt)
      const monthDate = parse(month, "MMMM", new Date(), { locale: ptBR })
      return isSameMonth(invoiceDate, monthDate)
    })

    const totalRevenue = monthInvoices.reduce(
      (acc, invoice) => acc + Number(invoice.total),
      0
    )

    return {
      month,
      monthTotal: totalRevenue || 0,
    }
  })
}

export const invoiceChart = new Elysia().get(
  "/invoice/chart",
  async ({ cookie }) => {
    const user = await auth({ cookie })
    if (!user) {
      throw new AuthError("Unauthorized", "UNAUTHORIZED", 401)
    }

    const hasCompany = user.Company
    if (!hasCompany) {
      throw new AuthError("Company not found", "COMPANY_NOT_FOUND", 404)
    }

    const currentYear = new Date().getFullYear()
    const startDate = startOfYear(new Date())
    const endDate = endOfYear(new Date())

    const invoices = await db.invoice.findMany({
      select: {
        id: true,
        createdAt: true,
        status: true,
        total: true,
      },
      where: {
        AND: [
          { company_id: hasCompany.id },
          { status: "PAID" },
          { createdAt: { gte: startDate, lte: endDate } },
        ],
      },
    })

    const filteredInvoices = invoices.filter(
      (invoice) => invoice.total !== null
    )

    const stats = calculateMonthlyRevenue(filteredInvoices, currentYear)

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
      tags: ["Invoice"],
    },
  }
)
