import Elysia, { t } from "elysia"
import { db } from "../../../lib/prisma"
import { auth } from "../../authentication"
import { AuthError } from "../errors/auth-error"

export const update = new Elysia().put(
  `/company/update/:companyId`,
  async ({ cookie, body }) => {
    const {
      cnpj,
      phone,
      state,
      city,
      cep,
      address,
      neighborhood,
      address_number,
      company_name,
      owner_id,
      stripeAccountId,
    } = body

    const user = await auth({ cookie })
    if (!user) {
      throw new AuthError("Unauthorized", "UNAUTHORIZED", 401)
    }

    const hasCompany = user.Company

    if (!hasCompany) {
      throw new AuthError("Company not found", "COMPANY_NOT_FOUND", 404)
    }

    const checkCompanyExists = await db.company.findUnique({
      where: {
        id: hasCompany.id,
      },
    })

    if (!checkCompanyExists) {
      throw new AuthError("Company not found", "COMPANY_NOT_FOUND", 404)
    }

    const company = await db.company.update({
      where: {
        id: hasCompany.id,
      },
      data: {
        cnpj,
        phone,
        state,
        city,
        cep,
        address,
        neighborhood,
        address_number,
        company_name,
        stripeAccountId,
      },
    })

    return {
      message: "Empresa atualizada com sucesso",
      company,
    }
  },
  {
    body: t.Object({
      cnpj: t.Optional(t.String()),
      phone: t.Optional(t.String()),
      state: t.Optional(t.String()),
      city: t.Optional(t.String()),
      cep: t.Optional(t.String()),
      address: t.Optional(t.String()),
      neighborhood: t.Optional(t.String()),
      address_number: t.Optional(t.String()),
      company_name: t.Optional(t.String()),
      owner_id: t.Optional(t.String()),
      stripeAccountId: t.Optional(t.String()),
    }),
    response: {
      201: t.Object(
        {
          message: t.String(),
          company: t.Object({
            cnpj: t.Optional(t.String()),
            phone: t.Optional(t.String()),
            state: t.Optional(t.String()),
            city: t.Optional(t.String()),
            cep: t.Optional(t.String()),
            address: t.Optional(t.String()),
            neighborhood: t.Optional(t.String()),
            address_number: t.Optional(t.String()),
            company_name: t.Optional(t.String()),
            owner_id: t.Optional(t.String()),
            stripeAccountId: t.Optional(t.String()),
          }),
        },
        {
          description: "Empresa atualizada com sucesso",
        }
      ),
      400: t.Object(
        {
          message: t.String(),
        },
        {
          description: "Invalid request",
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
      description: "Update a company",
      tags: ["Company"],
    },
  }
)
