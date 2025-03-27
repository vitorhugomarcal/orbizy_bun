import Elysia, { t } from "elysia"
import { db } from "../../../lib/prisma"
import { auth } from "../../authentication"
import { AuthError } from "../errors/auth-error"

export const checkCompanyCNPJ = new Elysia().get(
  `/company/check/cnpj/:cnpj`,
  async ({ cookie, params }) => {
    const { cnpj } = params

    const user = await auth({ cookie })

    if (!user) {
      throw new AuthError("Unauthorized", "UNAUTHORIZED", 401)
    }
    if (!cnpj) {
      throw new AuthError("CNPJ is required", "CNPJ_REQUIRED", 400)
    }

    const checkCompanyExists = await db.company.findUnique({
      where: {
        cnpj,
      },
    })

    if (!checkCompanyExists) {
      return {
        message: "Company not found",
        company: null,
      }
    } else {
      return {
        message: "Company already exists",
        company: checkCompanyExists,
      }
    }
  },
  {
    params: t.Object({
      cnpj: t.String(),
    }),
    response: {
      200: t.Object(
        {
          message: t.String(),
          company: t.Nullable(
            t.Object({
              id: t.String(),
              company_name: t.String(),
              cnpj: t.Nullable(t.String()),
              ein: t.Nullable(t.String()),
              phone: t.String(),
              stripeAccountId: t.Nullable(t.String()),
              owner_id: t.String(),
              address_id: t.String(),
            })
          ),
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
