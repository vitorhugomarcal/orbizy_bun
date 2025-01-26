import Elysia, { t } from "elysia"
import { db } from "../../../lib/prisma"
import { auth, type CookieProps } from "../../authentication"
import { AuthError } from "../errors/auth-error"

export const getCompany = new Elysia().get(
  "/company",
  async ({ cookie }: CookieProps) => {
    const user = await auth({ cookie })
    if (!user) {
      throw new AuthError("Unauthorized", "UNAUTHORIZED", 401)
    }

    const company = await db.company.findUnique({
      where: {
        id: user.Company?.id,
      },
    })

    if (!company) {
      throw new AuthError("Company not found", "COMPANY_NOT_FOUND", 400)
    }

    return {
      message: "Company found",
      company,
    }
  },
  {
    response: {
      200: t.Object({
        message: t.String(),
        company: t.Object({
          id: t.String(),
          cnpj: t.String(),
          phone: t.String(),
          state: t.String(),
          city: t.String(),
          cep: t.String(),
          address: t.String(),
          neighborhood: t.String(),
          address_number: t.String(),
          company_name: t.String(),
          owner_id: t.String(),
          createdAt: t.Date(),
        }),
      }),
      400: t.Object({
        code: t.String(),
        message: t.String(),
      }),
      401: t.Object({
        code: t.String(),
        message: t.String(),
      }),
    },
    detail: {
      description: "Get a company",
      tags: ["Company"],
    },
  }
)
