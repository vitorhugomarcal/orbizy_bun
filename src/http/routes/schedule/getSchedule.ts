import Elysia, { t } from "elysia"
import { db } from "../../../lib/prisma"
import { auth } from "../../authentication"
import { AuthError } from "../errors/auth-error"

export const getSchedule = new Elysia().get(
  "/schedule",
  async ({ cookie }) => {
    const user = await auth({ cookie })
    if (!user) {
      throw new AuthError("Unauthorized", "UNAUTHORIZED", 401)
    }

    const hasCompany = user.Company

    if (!hasCompany) {
      throw new AuthError("Company not found", "COMPANY_NOT_FOUND", 404)
    }

    const schedule = await db.schedule.findMany({
      where: {
        company_id: hasCompany.id,
      },
      include: {
        client: true,
      },
    })
    if (!schedule) {
      throw new AuthError("Schedule not found", "SCHEDULE_NOT_FOUND", 404)
    }

    return {
      message: "Schedule found successfully",
      schedule,
    }
  },
  {
    response: {
      200: t.Object(
        {
          message: t.String(),
          schedule: t.Array(
            t.Object({
              id: t.String(),
              date: t.Date(),
              deviceEventId: t.Nullable(t.String()),
              client: t.Object({
                id: t.String(),
                name: t.String(),
                email_address: t.String(),
                phone: t.String(),
              }),
            })
          ),
        },
        {
          description: "Schedule found successfully",
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
          description: "Schedule not found",
        }
      ),
    },
    detail: {
      description: "Get all schedules",
      tags: ["Schedule"],
    },
  }
)
