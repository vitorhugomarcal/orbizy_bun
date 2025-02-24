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
        supplier: true,
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

    console.log(formattedEstimate)

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
              cnpj: t.String(),
              phone: t.String(),
              state: t.String(),
              city: t.String(),
              address: t.String(),
              neighborhood: t.String(),
              address_number: t.String(),
              company_name: t.String(),
              cep: t.String(),
              email_address: t.String(),
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
