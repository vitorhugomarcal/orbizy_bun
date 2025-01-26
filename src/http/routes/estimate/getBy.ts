import Elysia, { t } from "elysia"
import { db } from "../../../lib/prisma"
import { auth } from "../../authentication"
import { AuthError } from "../errors/auth-error"

export const getEstimateById = new Elysia().get(
  `/estimate/:estimateId`,
  async ({ cookie, params }) => {
    const user = await auth({ cookie })
    if (!user) {
      throw new AuthError("Unauthorized", "UNAUTHORIZED", 401)
    }

    const { estimateId } = params

    const estimate = await db.estimate.findUnique({
      where: {
        id: estimateId,
      },
    })
    if (!estimate) {
      throw new AuthError("Orçamento não encontrado", "ESTIMATE_NOT_FOUND", 404)
    }

    const formattedEstimate = {
      estimate_number: estimate.estimate_number,
      status: estimate.status,
      notes: estimate.notes,
      sub_total: Number(estimate.sub_total),
      total: Number(estimate.total),
      client_id: estimate.client_id,
    }
    return {
      message: "Orçamento encontrado",
      formattedEstimate,
    }
  },
  {
    params: t.Object({
      estimateId: t.String(),
    }),
    response: {
      200: t.Object({
        message: t.String(),
        formattedEstimate: t.Object({
          estimate_number: t.Nullable(t.String()),
          status: t.Nullable(t.String()),
          notes: t.Nullable(t.String()),
          sub_total: t.Nullable(t.Number()),
          total: t.Nullable(t.Number()),
          client_id: t.Nullable(t.String()),
        }),
      }),
      401: t.Object({
        error: t.String(),
      }),
    },
    detail: {
      description: "Get a estimate by ID",
      tags: ["Estimate"],
    },
  }
)
