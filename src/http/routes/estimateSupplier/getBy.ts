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
      include: {
        EstimateSupplierItems: true,
        supplier: { include: { address: true } },
      },
    })

    if (!estimate) {
      throw new AuthError("Orçamento não encontrado", "ESTIMATE_NOT_FOUND", 404)
    }

    const formattedEstimate = {
      ...estimate,
      EstimateSupplierItems: estimate.EstimateSupplierItems.map((item) => {
        return {
          ...item,
          quantity: Number(item.quantity),
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
            status: t.Nullable(t.String()),
            notes: t.Nullable(t.String()),
            createdAt: t.Date(),
            estimate_supplier_number: t.Nullable(t.String()),
            supplier: t.Object({
              company_name: t.String(),
              email_address: t.String(),
              phone: t.String(),
              cnpj: t.Nullable(t.String()),
              ein: t.Nullable(t.String()),
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
            EstimateSupplierItems: t.Array(
              t.Object({
                id: t.String(),
                name: t.String(),
                quantity: t.Number(),
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
      tags: ["SupplierEstimate"],
    },
  }
)
