import Elysia, { t } from "elysia"
import { db } from "../../../lib/prisma"
import { auth } from "../../authentication"
import { AuthError } from "../errors/auth-error"

export const getByEstimate = new Elysia().get(
  "/itens/estimate/:estimateId",
  async ({ cookie, params }) => {
    const user = await auth({ cookie })
    if (!user) {
      throw new AuthError("Unauthorized", "UNAUTHORIZED", 401)
    }

    const { estimateId } = params
    if (!estimateId) {
      throw new AuthError(
        "ID do orçamento não encontrado",
        "ESTIMATE_ID_NOT_FOUND",
        404
      )
    }

    const item = await db.estimateItems.findMany({
      where: {
        estimate_id: estimateId,
      },
    })

    if (!item) {
      throw new AuthError("Nenhum item encontrado", "ITEM_NOT_FOUND", 404)
    }

    const formattedItens = item.map((item) => {
      return {
        id: item.id,
        name: item.name,
        estimate_id: item.estimate_id,
        unit: item.unit,
        price: Number(item.price),
        quantity: Number(item.quantity),
        total: Number(item.total),
      }
    })

    return {
      message: "Itens do orçamento",
      description: "Get estimate items by estimate id",
      formattedItens,
    }
  },
  {
    params: t.Object({
      estimateId: t.String(),
    }),
    response: {
      200: t.Object({
        message: t.String(),
        description: t.String(),
        formattedItens: t.Array(
          t.Object({
            id: t.Nullable(t.String()),
            name: t.Nullable(t.String()),
            quantity: t.Nullable(t.Number()),
            price: t.Nullable(t.Number()),
            unit: t.Nullable(t.String()),
            total: t.Nullable(t.Number()),
          })
        ),
      }),
      401: t.Object({
        message: t.String(),
        error: t.String(),
        description: t.String(),
      }),
      404: t.Object({
        message: t.String(),
        description: t.String(),
        error: t.String(),
      }),
    },
    detail: {
      description: "Get all estimate items by estimate ID",
      tags: ["EstimateItem"],
    },
  }
)
