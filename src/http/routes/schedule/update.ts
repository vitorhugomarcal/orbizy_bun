import Elysia, { t } from "elysia"
import { db } from "../../../lib/prisma"
import { auth } from "../../authentication"
import { AuthError } from "../errors/auth-error"

export const updateSchedule = new Elysia().put(
  `/schedule/update/:scheduleId`,
  async ({ cookie, body, params }) => {
    const { date } = body

    const user = await auth({ cookie })
    if (!user) {
      throw new AuthError("Unauthorized", "UNAUTHORIZED", 401)
    }

    const { scheduleId } = params

    if (!scheduleId) {
      throw new AuthError(
        "Agendamento não encontrado",
        "SCHEDULE_NOT_FOUND",
        404
      )
    }

    const checkScheduleExists = await db.schedule.findUnique({
      where: {
        id: scheduleId,
      },
    })

    if (!checkScheduleExists) {
      throw new AuthError(
        "Agendamento não encontrado",
        "SCHEDULE_NOT_FOUND",
        404
      )
    }

    const schedule = await db.schedule.update({
      where: {
        id: checkScheduleExists.id,
      },
      data: {
        date,
      },
    })

    return {
      message: "Agendamento atualizado com sucesso",
      schedule,
    }
  },
  {
    body: t.Object({
      date: t.Optional(t.Date()),
    }),
    response: {
      201: t.Object(
        {
          message: t.String(),
          schedule: t.Object({
            id: t.String(),
            date: t.Date(),
          }),
        },
        {
          description: "Agendamento atualizado com sucesso",
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
      description: "Update a schedule",
      tags: ["Schedule"],
    },
  }
)
