import Elysia, { t } from "elysia"
import { db } from "../../../lib/prisma"
import { auth } from "../../authentication"
import { AuthError } from "../errors/auth-error"

export const createEstimateSupplierItem = new Elysia().post(
  `/supplier/estimate/itens/create/:estimateId`,
  async ({ cookie, body, params }) => {
    const { name, quantity } = body

    const user = await auth({ cookie })
    if (!user) {
      throw new AuthError("Unauthorized", "UNAUTHORIZED", 401)
    }

    const { estimateId } = params

    if (!estimateId) {
      throw new AuthError("Orçamento não encontrado", "ESTIMATE_NOT_FOUND", 404)
    }

    const checkEstimateExists = await db.estimateSupplier.findUnique({
      where: {
        id: estimateId,
      },
    })

    if (!checkEstimateExists) {
      throw new AuthError("Orçamento não encontrado", "ESTIMATE_NOT_FOUND", 404)
    }

    const item = await db.estimateSupplierItems.create({
      data: {
        estimate_supplier_id: checkEstimateExists.id,
        name,
        quantity,
      },
    })

    const formattedItem = {
      ...item,
      quantity: Number(item.quantity),
    }

    return {
      message: "Item cadastrado com sucesso",
      item: formattedItem,
    }
  },
  {
    body: t.Object({
      name: t.String(),
      quantity: t.Number(),
    }),
    params: t.Object({
      estimateId: t.String(),
    }),
    response: {
      201: t.Object(
        {
          message: t.String(),
          item: t.Object({
            id: t.String(),
            name: t.String(),
            quantity: t.Number(),
          }),
        },
        {
          description: "Item cadastrado com sucesso",
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
      404: t.Object(
        {
          message: t.String(),
        },
        {
          description: "Orçamento não encontrado",
        }
      ),
    },
    detail: {
      description: "Create a new estimate item",
      tags: ["EstimateSupplierItem"],
    },
  }
)
