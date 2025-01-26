import Elysia, { t } from "elysia"
import { db } from "../../../lib/prisma"
import { auth } from "../../authentication"
import { AuthError } from "../errors/auth-error"

export const removeCompany = new Elysia().delete(
  `/company/remove/:companyId`,
  async ({ cookie, params }) => {
    const user = await auth({ cookie })
    if (!user) {
      throw new AuthError("Unauthorized", "UNAUTHORIZED", 401)
    }

    const { companyId } = params

    if (!companyId) {
      throw new AuthError("Company ID not provided", "MISSING_COMPANY_ID", 400)
    }

    await db.company.delete({
      where: {
        id: companyId,
      },
    })

    return {
      message: "Company removed successfully",
    }
  },
  {
    params: t.Object({
      companyId: t.String(),
    }),
    response: {
      204: t.Object(
        {
          message: t.String(),
        },
        {
          description: "Company removed successfully",
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
      400: t.Object(
        {
          message: t.String(),
        },
        {
          description: "Company not found",
        }
      ),
    },
    detail: {
      description: "Remove a company",
      tags: ["Company"],
    },
  }
)
