import Elysia, { t } from "elysia"
import { db } from "../../../lib/prisma"
import { auth } from "../../authentication"
import { AuthError } from "../errors/auth-error"

export const registerCompany = new Elysia().post(
  `/company/register`,
  async ({ cookie, body }) => {
    const {
      ein,
      cnpj,
      company_name,
      phone,
      country,
      city,
      state,
      postal_code,
      street,
      number,
      neighborhood,
      street_address,
      unit_number,
    } = body

    const user = await auth({ cookie })
    if (!user) {
      throw new AuthError("Unauthorized", "UNAUTHORIZED", 401)
    }

    const checkCompanyExists = await db.company.findUnique({
      where: {
        cnpj,
      },
    })

    if (checkCompanyExists) {
      throw new AuthError(
        "Company already exists",
        "COMPANY_ALREADY_EXISTS",
        400
      )
    }

    const address = await db.address.create({
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

    const company = await db.company.create({
      data: {
        ein,
        cnpj,
        phone,
        company_name,
        owner_id: user.id,
        address_id: address.id,
      },
      include: {
        address: true,
      },
    })

    await db.user.update({
      where: {
        id: user.id,
      },
      data: {
        company_id: company.id,
      },
    })

    return {
      message: "Cliente cadastrado com sucesso",
      company,
    }
  },
  {
    body: t.Object({
      ein: t.Optional(t.String()),
      cnpj: t.Optional(t.String()),
      company_name: t.String(),
      phone: t.String(),
      country: t.String(),
      city: t.String(),
      state: t.String(),
      postal_code: t.String(),
      street: t.Optional(t.String()),
      number: t.Optional(t.String()),
      neighborhood: t.Optional(t.String()),
      street_address: t.Optional(t.String()),
      unit_number: t.Optional(t.String()),
    }),
    response: {
      201: t.Object(
        {
          message: t.String(),
          company: t.Object({
            id: t.String(),
            ein: t.Nullable(t.String()),
            cnpj: t.Nullable(t.String()),
            company_name: t.String(),
            phone: t.String(),
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
            owner_id: t.String(),
          }),
        },
        {
          description: "Cliente cadastrado com sucesso",
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
      description: "Register a new company (individual or corporate)",
      tags: ["Company"],
    },
  }
)
