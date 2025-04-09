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
        service_order: true,
        client: {
          include: {
            address: true,
          },
        },
      },
    })

    if (!estimate) {
      throw new AuthError("Orçamento não encontrado", "ESTIMATE_NOT_FOUND", 404)
    }

    const formattedEstimate = {
      ...estimate,
      sub_total: Number(estimate.sub_total),
      total: Number(estimate.total),
      EstimateItems: estimate.EstimateItems.map((item) => {
        return {
          ...item,
          price: Number(item.price),
          quantity: Number(item.quantity),
          total: Number(item.total),
        }
      }),
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
            id: t.String(),
            estimate_number: t.Nullable(t.String()),
            status: t.Nullable(t.String()),
            notes: t.Nullable(t.String()),
            sub_total: t.Number(),
            total: t.Number(),
            client_id: t.String(),
            service_order: t.Array(
              t.Object({
                id: t.Nullable(t.String()),
              })
            ),
            client: t.Object({
              id: t.String(),
              name: t.String(),
              type: t.String(),
              company_name: t.Nullable(t.String()),
              cnpj: t.Nullable(t.String()),
              cpf: t.Nullable(t.String()),
              ein: t.Nullable(t.String()),
              ssn: t.Nullable(t.String()),
              email_address: t.String(),
              phone: t.String(),
              address: t.Object({
                id: t.String(),
                country: t.String(),
                city: t.String(),
                state: t.String(),
                postal_code: t.String(),
                street: t.Nullable(t.String()),
                number: t.Nullable(t.String()),
                neighborhood: t.Nullable(t.String()),
                street_address: t.Nullable(t.String()),
                unit_number: t.Nullable(t.String()),
              }),
            }),
            EstimateItems: t.Array(
              t.Object({
                id: t.String(),
                name: t.String(),
                price: t.Number(),
                quantity: t.Number(),
                unit: t.String(),
                description: t.Nullable(t.String()),
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
