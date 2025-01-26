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

    const clients = await db.client.findMany({
      where: {
        company_id: user.company_id,
      },
    })

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
      200: t.Object({
        total: t.Number(),
        new: t.Number(),
      }),
      401: t.Object({
        error: t.String(),
      }),
    },
    detail: {
      description: "Retrieve client count for the current month",
      tags: ["Clients"],
    },
  }
)
