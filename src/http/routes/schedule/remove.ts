import Elysia, { t } from "elysia"
import { db } from "../../../lib/prisma"
import { auth } from "../../authentication"
import { AuthError } from "../errors/auth-error"

export const removeSchedule = new Elysia().delete(
  `/schedule/remove/:scheduleId`,
  async ({ cookie, params }) => {
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

    await db.schedule.delete({
      where: {
        id: scheduleId,
      },
    })
    return {
      message: "Agendamento removido com sucesso",
    }
  },
  {
    params: t.Object({
      scheduleId: t.String(),
    }),
    response: {
      204: t.Object(
        {
          message: t.String(),
        },
        {
          description: "Agendamento removido com sucesso",
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
      description: "Remove um agendamento",
      tags: ["Schedule"],
    },
  }
)
