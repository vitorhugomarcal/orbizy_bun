import Elysia, { t } from "elysia"
import { db } from "../../../lib/prisma"
import { auth } from "../../authentication"
import { AuthError } from "../errors/auth-error"

export const getByEstimateSupplier = new Elysia().get(
  "/supplier/itens/estimate/:estimateId",
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

    const item = await db.estimateSupplierItems.findMany({
      where: {
        estimate_supplier_id: estimateId,
      },
    })

    if (!item) {
      throw new AuthError("Nenhum item encontrado", "ITEM_NOT_FOUND", 404)
    }

    const formattedItens = item.map((item) => {
      return {
        id: item.id,
        name: item.name,
        quantity: Number(item.quantity),
      }
    })

    return {
      message: "Itens do orçamento",
      formattedItens,
    }
  },
  {
    params: t.Object({
      estimateId: t.String(),
    }),
    response: {
      200: t.Object(
        {
          message: t.String(),
          formattedItens: t.Array(
            t.Object({
              id: t.String(),
              name: t.String(),
              quantity: t.Number(),
            })
          ),
        },
        {
          description: "Itens do orçamento",
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
      description: "Get all estimate items by estimate ID",
      tags: ["EstimateSupplierItem"],
    },
  }
)
