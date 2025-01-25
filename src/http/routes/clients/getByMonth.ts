import { endOfDay, isWithinInterval, startOfDay, startOfMonth } from "date-fns"
import Elysia from "elysia"
import { db } from "../../../lib/prisma"
import { auth, type CookieProps } from "../../authentication"

export const getByMonth = new Elysia().get(
  "/clients/month",
  async ({ cookie }: CookieProps) => {
    const user = await auth({ cookie })

    if (!user) {
      return { error: "Unauthorized" }
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
  }
)
