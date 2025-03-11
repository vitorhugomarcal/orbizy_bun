import Elysia, { t } from "elysia"
import { db } from "../../../lib/prisma"
import { auth } from "../../authentication"
import { AuthError } from "../errors/auth-error"

export const getById = new Elysia().get(
  "/schedule/:scheduleId",
  async ({ cookie, params }) => {
    const user = await auth({ cookie })
    if (!user) {
      throw new AuthError("Unauthorized", "UNAUTHORIZED", 401)
    }

    const { scheduleId } = params

    if (!scheduleId) {
      throw new AuthError("Schedule não encontrado", "Schedule_NOT_FOUND", 404)
    }

    const checkScheduleExists = await db.schedule.findUnique({
      where: {
        id: scheduleId,
      },
      include: {
        client: true,
      },
    })

    if (!checkScheduleExists) {
      throw new AuthError("Schedule não encontrado", "Schedule_NOT_FOUND", 404)
    }

    return {
      message: "Agendamento encontrado",
      schedule: checkScheduleExists,
    }
  },
  {
    params: t.Object({
      scheduleId: t.String(),
    }),
    response: {
      200: t.Object(
        {
          message: t.String(),
          schedule: t.Object({
            id: t.String(),
            date: t.Date(),
            deviceEventId: t.Nullable(t.String()),
            client: t.Object({
              id: t.String(),
              name: t.String(),
              email_address: t.String(),
              phone: t.String(),
            }),
          }),
        },
        {
          description: "Agendamento encontrado",
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
          description: "Agendamento não encontrado",
        }
      ),
    },
    detail: {
      description: "Get a schedule by id",
      tags: ["Schedule"],
    },
  }
)
