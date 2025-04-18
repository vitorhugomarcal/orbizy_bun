import Elysia, { t } from "elysia"
import { db } from "../../../lib/prisma"
import { auth } from "../../authentication"
import { AuthError } from "../errors/auth-error"

export const getAllSupplierEstimates = new Elysia().get(
  "/supplier/estimate",
  async ({ cookie }) => {
    const user = await auth({ cookie })
    if (!user) {
      throw new AuthError("Unauthorized", "UNAUTHORIZED", 401)
    }

    const hasCompany = user.Company

    if (!hasCompany) {
      throw new AuthError("Company not found", "COMPANY_NOT_FOUND", 404)
    }

    const estimates = await db.estimateSupplier.findMany({
      where: {
        company_id: hasCompany.id,
      },
      include: {
        supplier: {
          include: {
            address: true,
          },
        },
        EstimateSupplierItems: true,
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
        ...estimate,
        formattedEstimateSupplierItems: estimate.EstimateSupplierItems.map(
          (item) => {
            return {
              ...item,
              quantity: Number(item.quantity),
            }
          }
        ),
      }
    })

    return {
      message: "Orçamentos encontrados",
      estimates: formattedEstimates,
    }
  },
  {
    response: {
      200: t.Object(
        {
          message: t.String(),
          estimates: t.Array(
            t.Object({
              id: t.String(),
              estimate_supplier_number: t.Nullable(t.String()),
              status: t.Nullable(t.String()),
              notes: t.Nullable(t.String()),
              supplier_id: t.Nullable(t.String()),
              company_id: t.Nullable(t.String()),
              createdAt: t.Date(),
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
                  name: t.String(),
                  quantity: t.Number(),
                })
              ),
            })
          ),
        },
        {
          description: "Orçamentos encontrados",
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
          description: "Orçamentos não encontrados",
        }
      ),
    },
    detail: {
      description: "Get all estimates",
      tags: ["SupplierEstimate"],
    },
  }
)
