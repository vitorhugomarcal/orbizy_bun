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

    if (!estimateId) {
      throw new AuthError("Orçamento não encontrado", "ESTIMATE_NOT_FOUND", 404)
    }

    const estimate = await db.estimate.findUnique({
      where: {
        id: estimateId,
      },
      include: {
        EstimateItems: true,
        client: true,
      },
    })

    if (!estimate) {
      throw new AuthError("Orçamento não encontrado", "ESTIMATE_NOT_FOUND", 404)
    }

    const formattedEstimate = {
      ...estimate,
      sub_total: Number(estimate.sub_total),
      total: Number(estimate.total),
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
            estimate_number: t.Nullable(t.String()),
            status: t.Nullable(t.String()),
            notes: t.Nullable(t.String()),
            sub_total: t.Nullable(t.Number()),
            total: t.Nullable(t.Number()),
            client_id: t.String(),
            client: t.Object({
              type: t.String(),
              cpf: t.Nullable(t.String()),
              cnpj: t.Nullable(t.String()),
              company_name: t.Nullable(t.String()),
              name: t.String(),
              email_address: t.String(),
              phone: t.String(),
              cep: t.String(),
              address: t.String(),
              address_number: t.String(),
              neighborhood: t.String(),
              city: t.String(),
              state: t.String(),
            }),
            EstimateItems: t.Array(
              t.Object({
                name: t.String(),
                description: t.Nullable(t.String()),
                price: t.Number(),
                quantity: t.Number(),
                unit: t.String(),
                total: t.Number(),
              })
            ),
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
      tags: ["Estimate"],
    },
  }
)
