import Elysia, { t } from "elysia"
import { db } from "../../../lib/prisma"
import { auth } from "../../authentication"
import { AuthError } from "../errors/auth-error"

export const checkCompanyEIN = new Elysia().get(
  `/company/check/ein/:ein`,
  async ({ cookie, params }) => {
    const { ein } = params

    const user = await auth({ cookie })
    if (!user) {
      throw new AuthError("Unauthorized", "UNAUTHORIZED", 401)
    }

    const checkCompanyExists = await db.company.findUnique({
      where: {
        ein,
      },
    })

    if (checkCompanyExists) {
      return {
        message: "Company already exists",
      }
    } else {
      return {
        message: "Company not found",
      }
    }
  },
  {
    params: t.Object({
      ein: t.String(),
    }),
    response: {
      200: t.Object(
        {
          message: t.String(),
        },
        {
          description: "Company not found",
        }
      ),
      400: t.Object(
        {
          message: t.String(),
        },
        {
          description: "Company already exists",
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
    },
    detail: {
      description: "Check if company exists (individual or corporate)",
      tags: ["Company"],
    },
  }
)
