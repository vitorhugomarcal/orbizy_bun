import { endOfDay, isWithinInterval, startOfDay, startOfMonth } from "date-fns"
import Elysia, { t } from "elysia"
import { db } from "../../../lib/prisma"
import { auth, type CookieProps } from "../../authentication"
import { AuthError } from "../errors/auth-error"

export const getByMonth = new Elysia().get(
  "/clients/month",
  async ({ cookie }: CookieProps) => {
    const user = await auth({ cookie })
    if (!user) {
      throw new AuthError("Unauthorized", "UNAUTHORIZED", 401)
    }

    const hasCompany = user.Company
    if (!hasCompany) {
      throw new AuthError("Company not found", "COMPANY_NOT_FOUND", 401)
    }

    const clients = await db.client.findMany({
      where: {
        company_id: hasCompany.id,
      },
    })

    if (!clients) {
      throw new AuthError("Clients not found", "CLIENTS_NOT_FOUND", 404)
    }

    const today = new Date()
    const monthStart = startOfMonth(today)

    const newClients = clients.filter((client) => {
      const createdAt = client.createdAt
      return isWithinInterval(createdAt, {
        start: startOfDay(monthStart),
        end: endOfDay(today),
      })
    })

    const newClientsCount = newClients.length

    return {
      total: clients.length,
      new: newClientsCount,
    }
  },
  {
    response: {
      200: t.Object(
        {
          total: t.Number({
            description: "Total number of clients",
          }),
          new: t.Number({
            description: "Number of new clients in the current month",
          }),
        },
        {
          description: "Client count for the current month",
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
          description: "Clients not found",
        }
      ),
    },
    detail: {
      description: "Retrieve client count for the current month",
      tags: ["Clients"],
    },
  }
)
