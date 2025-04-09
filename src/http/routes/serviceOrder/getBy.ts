import Elysia, { t } from "elysia"
import { db } from "../../../lib/prisma"
import { auth } from "../../authentication"
import { AuthError } from "../errors/auth-error"

export const getOrderById = new Elysia().get(
  `/order/:orderId`,
  async ({ cookie, params }) => {
    const user = await auth({ cookie })
    if (!user) {
      throw new AuthError("Unauthorized", "UNAUTHORIZED", 401)
    }

    const { orderId } = params

    if (!orderId) {
      throw new AuthError("Orçamento não encontrado", "ESTIMATE_NOT_FOUND", 404)
    }

    const order = await db.serviceOrder.findUnique({
      where: {
        id: orderId,
      },
      include: {
        estimate: {
          include: {
            client: { include: { address: true } },
          },
        },
        user: true,
      },
    })

    console.log(JSON.stringify(order, null, 2))

    if (!order) {
      throw new AuthError(
        "Ordem de serviço não encontrada",
        "SERVICE_ORDER_NOT_FOUND",
        404
      )
    }

    return {
      message: "Ordem de serviço encontrada",
      order,
    }
  },
  {
    params: t.Object({
      orderId: t.String(),
    }),
    response: {
      200: t.Object(
        {
          message: t.String(),
          order: t.Object({
            id: t.String(),
            order_number: t.Nullable(t.String()),
            status: t.String(),
            notes: t.Nullable(t.String()),
            created_at: t.Date(),
            finished_at: t.Nullable(t.Date()),
            estimate: t.Object({
              id: t.String(),
              estimate_number: t.String(),
              notes: t.Nullable(t.String()),
              client: t.Object({
                id: t.String(),
                name: t.String(),
                type: t.String(),
                company_name: t.Nullable(t.String()),
                email_address: t.Nullable(t.String()),
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
              user: t.Object({
                id: t.String(),
                name: t.String(),
                email_address: t.String(),
              }),
            }),
          }),
        },
        {
          description: "Ordem de serviço encontrada",
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
          description: "Ordem de serviço não encontrada",
        }
      ),
    },
    detail: {
      description: "Get a service order by ID",
      tags: ["ServiceOrder"],
    },
  }
)
