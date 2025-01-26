import Elysia, { t } from "elysia"
import { db } from "../../../lib/prisma"
import { auth } from "../../authentication"
import { AuthError } from "../errors/auth-error"

export const removeClient = new Elysia().delete(
  `/client/remove/:clientId`,
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

    await db.client.delete({
      where: {
        id: clientId,
      },
    })

    return {
      message: "Client removed successfully",
    }
  },
  {
    params: t.Object({
      clientId: t.String(),
    }),
    response: {
      204: t.Object(
        {
          message: t.String(),
        },
        {
          description: "Client removed successfully",
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
      400: t.Object(
        {
          message: t.String(),
        },
        {
          description: "ID do cliente não fornecido",
        }
      ),
    },
    detail: {
      description: "Remove a client",
      tags: ["Clients"],
    },
  }
)
