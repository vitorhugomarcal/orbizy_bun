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
    } = body

    const user = await auth({ cookie })
    if (!user) {
      throw new AuthError("Unauthorized", "UNAUTHORIZED", 401)
    }

    const checkCompanyExists = await db.company.findUnique({
      where: {
        id: user.Company?.id,
      },
    })
    if (!checkCompanyExists) {
      throw new AuthError("Company not found", "COMPANY_NOT_FOUND", 404)
    }

    const company = await db.company.update({
      where: {
        id: user.Company?.id,
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
    }),
    response: {
      201: t.Object({
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
      description: "Update a company",
      tags: ["Company"],
    },
  }
)
