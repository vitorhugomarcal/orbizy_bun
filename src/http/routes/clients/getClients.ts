import Elysia from "elysia"
import { db } from "../../../lib/prisma"
import { auth, type CookieProps } from "../../authentication"

export const getClients = new Elysia().get(
  "/company/clients",
  async ({ cookie }: CookieProps) => {
    const user = await auth({ cookie })

    if (!user) {
      return { error: "Unauthorized" }
    }

    const clients = await db.client.findMany({
      where: {
        company_id: user.company_id,
      },
      include: {
        invoice: true,
      },
    })
    return clients
  }
)
