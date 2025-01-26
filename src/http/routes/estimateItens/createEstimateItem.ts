import Elysia, { t } from "elysia"
import { db } from "../../../lib/prisma"
import { auth } from "../../authentication"
import { AuthError } from "../errors/auth-error"

export const createEstimateItem = new Elysia().post(
  `/estimate/itens/create/:estimateId`,
  async ({ cookie, body, params }) => {
    const { name, quantity, price, unit, total } = body

    const user = await auth({ cookie })
    if (!user) {
      throw new AuthError("Unauthorized", "UNAUTHORIZED", 401)
    }

    const { estimateId } = params

    const checkEstimateExists = await db.estimate.findUnique({
      where: {
        id: estimateId,
      },
    })
    if (!checkEstimateExists) {
      throw new AuthError("Orçamento não encontrado", "ESTIMATE_NOT_FOUND", 404)
    }

    const item = await db.estimateItems.create({
      data: {
        estimate_id: estimateId,
        name,
        quantity,
        price,
        unit,
        total,
      },
    })

    return {
      message: "Item cadastrado com sucesso",
      description: "Create a new estimate item",
      item,
    }
  },
  {
    body: t.Object({
      name: t.String(),
      quantity: t.Number(),
      price: t.Number(),
      unit: t.String(),
      total: t.Number(),
    }),
    params: t.Object({
      estimateId: t.String(),
    }),
    response: {
      201: t.Object({
        message: t.String(),
        description: t.String(),
        item: t.Object({
          id: t.String(),
          name: t.String(),
          quantity: t.Number(),
          price: t.Number(),
          unit: t.String(),
          total: t.Number(),
        }),
      }),
      401: t.Object({
        error: t.String(),
        description: t.String(),
      }),
    },
    detail: {
      description: "Create a new estimate item",
      tags: ["EstimateItem"],
    },
  }
)
