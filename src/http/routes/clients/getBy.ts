import Elysia, { t } from "elysia"
import { db } from "../../../lib/prisma"
import { auth } from "../../authentication"
import { AuthError } from "../errors/auth-error"

export const getBy = new Elysia().get(
  "/clients/:clientId",
  async ({ cookie, params }) => {
    const user = await auth({ cookie })
    if (!user) {
      throw new AuthError("Unauthorized", "UNAUTHORIZED", 401)
    }

    const { clientId } = params

    if (!clientId) {
      throw new AuthError(
        "ID do cliente não fornecido",
        "MISSING_CLIENT_ID",
        400
      )
    }

    const clients = await db.client.findUnique({
      where: {
        id: clientId,
      },
      include: {
        invoice: true,
      },
    })
    return clients
  },

  {
    params: t.Object({
      clientId: t.String(),
    }),
  }
)
