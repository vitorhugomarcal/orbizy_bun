import Elysia, { t } from "elysia"
import { db } from "../../../lib/prisma"
import { auth } from "../../authentication"
import { AuthError } from "../errors/auth-error"

export const update = new Elysia().put(
  `/company/update/:companyId`,
  async ({ cookie, body }) => {
    const {
      ein,
      cnpj,
      company_name,
      phone,
      address: {
        country,
        city,
        state,
        postal_code,
        street,
        number,
        neighborhood,
        street_address,
        unit_number,
      },
      stripeAccountId,
    } = body

    const user = await auth({ cookie })
    if (!user) {
      throw new AuthError("Unauthorized", "UNAUTHORIZED", 401)
    }

    const hasCompany = user.Company

    if (!hasCompany || !hasCompany.address_id) {
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

    await db.address.update({
      where: {
        id: hasCompany.address_id,
      },
      data: {
        country,
        city,
        state,
        postal_code,
        street,
        number,
        neighborhood,
        street_address,
        unit_number,
      },
    })

    const company = await db.company.update({
      where: {
        id: hasCompany.id,
      },
      data: {
        cnpj,
        ein,
        phone,
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
      ein: t.Optional(t.String()),
      cnpj: t.Optional(t.String()),
      phone: t.Optional(t.String()),
      company_name: t.Optional(t.String()),
      owner_id: t.Optional(t.String()),
      stripeAccountId: t.Optional(t.String()),
      address: t.Object({
        country: t.Optional(t.String()),
        city: t.Optional(t.String()),
        state: t.Optional(t.String()),
        postal_code: t.Optional(t.String()),
        street: t.Optional(t.String()),
        number: t.Optional(t.String()),
        neighborhood: t.Optional(t.String()),
        street_address: t.Optional(t.String()),
        unit_number: t.Optional(t.String()),
      }),
    }),
    response: {
      201: t.Object(
        {
          message: t.String(),
          company: t.Object({
            ein: t.Nullable(t.String()),
            cnpj: t.Nullable(t.String()),
            phone: t.String(),
            company_name: t.String(),
            owner_id: t.String(),
            stripeAccountId: t.String(),
            address: t.Object({
              id: t.String(),
              country: t.String(),
              city: t.String(),
              state: t.String(),
              postal_code: t.String(),
              street: t.Nullable(t.String()),
              number: t.Nullable(t.String()),
              neighborhood: t.Nullable(t.String()),
              street_address: t.Nullable(t.String()),
              unit_number: t.Nullable(t.String()),
            }),
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
