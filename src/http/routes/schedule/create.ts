import Elysia, { t } from "elysia"
import { db } from "../../../lib/prisma"
import { auth } from "../../authentication"
import { AuthError } from "../errors/auth-error"

export const createSchedule = new Elysia().post(
  `/schedule/create/:clientId`,
  async ({ cookie, body, params }) => {
    const { date, deviceEventId } = body
    const { clientId } = params

    const user = await auth({ cookie })
    if (!user) {
      throw new AuthError("Unauthorized", "UNAUTHORIZED", 401)
    }

    const hasCompany = user.Company

    if (!hasCompany) {
      throw new AuthError("Company not found", "COMPANY_NOT_FOUND", 404)
    }

    if (!clientId) {
      throw new AuthError("Client not found", "CLIENT_NOT_FOUND", 404)
    }

    const client = await db.client.findUnique({
      where: {
        id: clientId,
      },
    })

    if (!client) {
      throw new AuthError("Client not found", "CLIENT_NOT_FOUND", 404)
    }

    const schedule = await db.schedule.create({
      data: {
        client_id: client.id,
        company_id: hasCompany.id,
        date,
        deviceEventId,
      },
    })

    return {
      message: "Agendamento cadastrado com sucesso",
      schedule,
    }
  },
  {
    body: t.Object({
      date: t.Date(),
      deviceEventId: t.Nullable(t.String()),
    }),
    params: t.Object({
      clientId: t.String(),
    }),
    response: {
      201: t.Object(
        {
          message: t.String(),
          schedule: t.Object({
            id: t.String(),
            date: t.Date(),
            deviceEventId: t.Nullable(t.String()),
          }),
        },
        {
          description: "Item cadastrado com sucesso",
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
          description: "Company not found",
        }
      ),
    },
    detail: {
      description: "Cadastra um novo agendamento",
      tags: ["Schedule"],
    },
  }
)
