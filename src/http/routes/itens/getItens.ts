import Elysia, { t } from "elysia"
import { db } from "../../../lib/prisma"
import { auth } from "../../authentication"
import { AuthError } from "../errors/auth-error"

export const getItens = new Elysia().get(
  "/itens",
  async ({ cookie }) => {
    const user = await auth({ cookie })
    if (!user) {
      throw new AuthError("Unauthorized", "UNAUTHORIZED", 401)
    }

    const itens = await db.item.findMany({
      where: {
        company_id: user.company_id,
      },
    })
    if (!itens) {
      throw new AuthError("Itens not found", "ITENS_NOT_FOUND", 404)
    }

    const formattedItens = itens.map((item) => ({
      ...item,
      price: Number(item.price),
    }))
    return {
      message: "Itens found successfully",
      formattedItens,
    }
  },
  {
    response: {
      200: t.Object({
        message: t.String(),
        formattedItens: t.Array(
          t.Object({
            id: t.String(),
            name: t.String(),
            price: t.Number(),
            description: t.String(),
            unit: t.String(),
          })
        ),
      }),
      401: t.Object({
        error: t.String(),
      }),
    },
    detail: {
      description: "Get all itens",
      tags: ["Itens"],
    },
  }
)
