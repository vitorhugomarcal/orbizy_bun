import Elysia, { t } from "elysia"
import { db } from "../../../lib/prisma"
import { auth } from "../../authentication"
import { AuthError } from "../errors/auth-error"

export const updateEstimate = new Elysia().put(
  `/estimate/update/:estimateId`,
  async ({ cookie, body, params }) => {
    const { estimate_number, status, notes, sub_total, total } = body
    const user = await auth({ cookie })
    if (!user) {
      throw new AuthError("Unauthorized", "UNAUTHORIZED", 401)
    }

    const { estimateId } = params

    if (!estimateId) {
      throw new AuthError("Orçamento não encontrado", "ESTIMATE_NOT_FOUND", 404)
    }

    const checkEstimateExists = await db.estimate.findUnique({
      where: {
        id: estimateId,
      },
    })

    if (!checkEstimateExists) {
      throw new AuthError("Orçamento não encontrado", "ESTIMATE_NOT_FOUND", 404)
    }

    const estimate = await db.estimate.update({
      where: {
        id: estimateId,
      },
      data: {
        estimate_number,
        status,
        notes,
        sub_total,
        total,
      },
    })

    const formattedEstimate = {
      ...estimate,
      sub_total: Number(estimate.sub_total),
      total: Number(estimate.total),
    }

    return {
      message: "Orçamento atualizado com sucesso",
      estimate: formattedEstimate,
    }
  },
  {
    body: t.Object({
      estimate_number: t.Optional(t.String()),
      status: t.Optional(t.String()),
      notes: t.Optional(t.String()),
      sub_total: t.Optional(t.Number()),
      total: t.Optional(t.Number()),
    }),
    params: t.Object({
      estimateId: t.String(),
    }),
    response: {
      201: t.Object(
        {
          message: t.String(),
          estimate: t.Object({
            estimate_number: t.String(),
            status: t.String(),
            notes: t.String(),
            sub_total: t.Number(),
            total: t.Number(),
          }),
        },
        {
          description: "Orçamento atualizado com sucesso",
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
      description: "Update a estimate",
      tags: ["Estimate"],
    },
  }
)
