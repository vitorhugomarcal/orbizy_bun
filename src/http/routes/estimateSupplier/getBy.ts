import Elysia, { t } from "elysia"
import { db } from "../../../lib/prisma"
import { auth } from "../../authentication"
import { AuthError } from "../errors/auth-error"

export const getSupplierEstimateById = new Elysia().get(
  `/supplier/estimate/:estimateId`,
  async ({ cookie, params }) => {
    const user = await auth({ cookie })
    if (!user) {
      throw new AuthError("Unauthorized", "UNAUTHORIZED", 401)
    }

    const { estimateId } = params

    if (!estimateId) {
      throw new AuthError("Orçamento não encontrado", "ESTIMATE_NOT_FOUND", 404)
    }

    const estimate = await db.estimateSupplier.findUnique({
      where: {
        id: estimateId,
      },
    })

    if (!estimate) {
      throw new AuthError("Orçamento não encontrado", "ESTIMATE_NOT_FOUND", 404)
    }

    const formattedEstimate = {
      ...estimate,
    }
    return {
      message: "Orçamento encontrado",
      estimate: formattedEstimate,
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
          estimate: t.Object({
            estimate_number: t.String(),
            status: t.String(),
            notes: t.String(),
            sub_total: t.Number(),
            total: t.Number(),
            client_id: t.String(),
          }),
        },
        {
          description: "Orçamento encontrado",
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
      description: "Get a estimate by ID",
      tags: ["SupplierEstimate"],
    },
  }
)
