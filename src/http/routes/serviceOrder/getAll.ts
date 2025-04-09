import Elysia, { t } from "elysia"
import { db } from "../../../lib/prisma"
import { auth } from "../../authentication"
import { AuthError } from "../errors/auth-error"

export const getAllServicesOrders = new Elysia().get(
  "/orders",
  async ({ cookie }) => {
    const user = await auth({ cookie })
    if (!user) {
      throw new AuthError("Unauthorized", "UNAUTHORIZED", 401)
    }

    const hasCompany = user.Company

    if (!hasCompany) {
      throw new AuthError("Company not found", "COMPANY_NOT_FOUND", 404)
    }

    const orders = await db.serviceOrder.findMany({
      where: {
        company_id: hasCompany.id,
      },
      include: {
        estimate: {
          include: {
            client: {
              include: {
                address: true,
              },
            },
          },
        },
        user: true,
      },
    })

    if (!orders) {
      throw new AuthError(
        "Ordens de serviço não encontradas",
        "SERVICE_ORDERS_NOT_FOUND",
        404
      )
    }

    return {
      message: "Ordens de serviços encontradas",
      orders,
    }
  },
  {
    response: {
      200: t.Object(
        {
          message: t.String(),
          orders: t.Array(
            t.Object({
              id: t.String(),
              order_number: t.Nullable(t.String()),
              status: t.Nullable(t.String()),
              notes: t.Nullable(t.String()),
              created_at: t.Date(),
              finished_at: t.Nullable(t.Date()),
              user: t.Object({
                id: t.String(),
                name: t.String(),
                email: t.String(),
              }),
              estimate: t.Object({
                id: t.String(),
                estimate_number: t.String(),
                status: t.String(),
                notes: t.String(),
                client: t.Object({
                  id: t.String(),
                  name: t.String(),
                  type: t.String(),
                  company_name: t.Nullable(t.String()),
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
              }),
            })
          ),
        },
        {
          description: "Ordens de serviços encontradas",
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
          description: "Ordens de serviços não encontradas",
        }
      ),
    },
    detail: {
      description: "Get all services orders",
      tags: ["ServiceOrder"],
    },
  }
)
