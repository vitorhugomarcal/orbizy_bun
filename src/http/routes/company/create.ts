import Elysia, { t } from "elysia"
import { db } from "../../../lib/prisma"
import { auth } from "../../authentication"
import { AuthError } from "../errors/auth-error"

export const registerCompany = new Elysia().post(
  `/company/register`,
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

    const company = await db.company.create({
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
        owner_id: user.id,
      },
    })

    return {
      message: "Cliente cadastrado com sucesso",
      company,
    }
  },
  {
    body: t.Object({
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
    }),
  }
)
