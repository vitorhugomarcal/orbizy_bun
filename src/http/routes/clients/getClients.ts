import Elysia from "elysia"
import { auth, type CookieProps } from "../../authentication"
import { db } from "../../../lib/prisma"

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
