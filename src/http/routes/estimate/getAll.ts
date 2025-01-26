import Elysia, { t } from "elysia"
import { db } from "../../../lib/prisma"
import { auth } from "../../authentication"
import { AuthError } from "../errors/auth-error"

export const getAllEstimates = new Elysia().get(
  "/estimate",
  async ({ cookie }) => {
    const user = await auth({ cookie })
    if (!user) {
      throw new AuthError("Unauthorized", "UNAUTHORIZED", 401)
    }

    const estimates = await db.estimate.findMany({
      where: {
        company_id: user.company_id,
      },
    })

    if (!estimates) {
      throw new AuthError(
        "Orçamentos não encontrados",
        "ESTIMATES_NOT_FOUND",
        404
      )
    }

    const formattedEstimates = estimates.map((estimate) => {
      return {
        estimate_number: estimate.estimate_number,
        status: estimate.status,
        notes: estimate.notes,
        sub_total: Number(estimate.sub_total),
        total: Number(estimate.total),
        client_id: estimate.client_id,
      }
    })
    return {
      message: "Orçamentos encontrados",
      formattedEstimates,
    }
  },
  {
    response: {
      200: t.Object({
        message: t.String(),
        formattedEstimates: t.Array(
          t.Object({
            estimate_number: t.Nullable(t.String()),
            status: t.Nullable(t.String()),
            notes: t.Nullable(t.String()),
            sub_total: t.Nullable(t.Number()),
            total: t.Nullable(t.Number()),
            client_id: t.Nullable(t.String()),
          })
        ),
      }),
      401: t.Object({
        error: t.String(),
      }),
    },
    detail: {
      description: "Get all estimates",
      tags: ["Estimate"],
    },
  }
)
