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
      204: t.Object({
        message: t.String(),
      }),
      401: t.Object({
        error: t.String(),
      }),
    },
    detail: {
      description: "Remove a client",
      tags: ["Clients"],
    },
  }
)
