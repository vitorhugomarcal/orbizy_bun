import Elysia, { t } from "elysia"
import { db } from "../../../lib/prisma"
import { env } from "../../../env"
import { auth, type CookieProps } from "../../authentication"

class AuthError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number
  ) {
    super(message)
    this.name = "AuthError"
  }
}

export const registerClient = new Elysia().post(
  `/client/register`,
  async ({ cookie, body }) => {
    // Changed this line - single destructuring
    const {
      type,
      email_address,
      name,
      company_name,
      cpf,
      cnpj,
      phone,
      cep,
      address,
      address_number,
      neighborhood,
      state,
      city,
    } = body

    const user = await auth({ cookie })

    if (!user) {
      throw new AuthError("Unauthorized", "UNAUTHORIZED", 401)
    }

    const client = await db.client.create({
      data: {
        company_id: user.Company?.id,
        type,
        email_address,
        name,
        company_name: type === "jurídica" ? company_name : null,
        cpf: type === "física" ? cpf : null,
        cnpj: type === "jurídica" ? cnpj : null,
        phone,
        cep,
        address,
        address_number,
        neighborhood,
        state,
        city,
      },
    })
    return client
  },
  {
    body: t.Object({
      type: t.String(),
      email_address: t.String(),
      name: t.String(),
      company_name: t.Optional(t.String()),
      cpf: t.Optional(t.String()),
      cnpj: t.Optional(t.String()),
      phone: t.String(),
      cep: t.String(),
      address: t.String(),
      address_number: t.String(),
      neighborhood: t.String(),
      state: t.String(),
      city: t.String(),
    }),
  }
)
