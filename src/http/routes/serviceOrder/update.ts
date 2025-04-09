import Elysia, { t } from "elysia"
import { db } from "../../../lib/prisma"
import { auth } from "../../authentication"
import { AuthError } from "../errors/auth-error"

export const updateServiceOrder = new Elysia().put(
  `/order/update/:orderId`,
  async ({ cookie, body, params }) => {
    const { order_number, status, notes } = body
    const user = await auth({ cookie })
    if (!user) {
      throw new AuthError("Unauthorized", "UNAUTHORIZED", 401)
    }

    const { orderId } = params

    if (!orderId) {
      throw new AuthError(
        "ID da ordem de serviço não fornecido",
        "MISSING_ORDER_ID",
        400
      )
    }

    const checkInvoiceExists = await db.invoice.findUnique({
      where: {
        id: orderId,
      },
    })

    if (!checkInvoiceExists) {
      throw new AuthError(
        "Ordem de serviço não encontrada",
        "ORDER_NOT_FOUND",
        404
      )
    }

    const order = await db.serviceOrder.update({
      where: {
        id: orderId,
      },
      data: {
        order_number,
        status,
        notes,
        finished_at: new Date(),
      },
    })

    return {
      message: "Ordem de serviço atualizado com sucesso",
      order,
    }
  },
  {
    body: t.Object({
      order_number: t.Optional(t.String()),
      status: t.Optional(t.String()),
      notes: t.Optional(t.String()),
    }),
    params: t.Object({
      orderId: t.String(),
    }),
    response: {
      201: t.Object(
        {
          message: t.String(),
          order: t.Object({
            order_number: t.String(),
            status: t.String(),
            notes: t.String(),
            finished_at: t.Date(),
          }),
        },
        {
          description: "Ordem de serviço atualizada com sucesso",
        }
      ),
      400: t.Object(
        {
          message: t.String(),
        },
        {
          description: "Order Id not found",
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
      description: "Update a service order",
      tags: ["ServiceOrder"],
    },
  }
)
