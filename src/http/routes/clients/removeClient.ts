import Elysia, { t } from "elysia"
import { db } from "../../../lib/prisma"

class AuthError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number
  ) {
    super(message)
    this.name = "AuthError"
  }
}

export const removeClient = new Elysia().delete(
  `/remove/client/:clientId`,
  async ({ params }) => {
    const { clientId } = params

    await db.client.delete({
      where: {
        id: clientId,
      },
    })
  },
  {
    params: t.Object({
      clientId: t.String(),
    }),
  }
)
