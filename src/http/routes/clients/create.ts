import Elysia, { t } from "elysia"
import { db } from "../../../lib/prisma"
import { auth } from "../../authentication"
import { AuthError } from "../errors/auth-error"

export const registerClient = new Elysia().post(
  `/client/register`,
  async ({ cookie, body }) => {
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

    const hasCompany = user.Company

    if (!hasCompany) {
      throw new AuthError("Company not found", "COMPANY_NOT_FOUND", 404)
    }

    const existingClient = await db.client.findFirst({
      where: {
        company_id: hasCompany.id,
        OR: [
          { email_address },
          { cpf: cpf || undefined },
          { cnpj: cnpj || undefined },
        ],
      },
    })

    if (existingClient) {
      throw new AuthError("Cliente já cadastrado", "CLIENT_ALREADY_EXISTS", 400)
    }

    const client = await db.client.create({
      data: {
        company_id: hasCompany.id,
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

    return {
      message: "Cliente cadastrado com sucesso",
      client,
    }
  },
  {
    body: t.Object({
      type: t.String(),
      email_address: t.String(),
      name: t.String(),
      company_name: t.String(),
      cpf: t.String(),
      cnpj: t.String(),
      phone: t.String(),
      cep: t.String(),
      address: t.String(),
      address_number: t.String(),
      neighborhood: t.String(),
      state: t.String(),
      city: t.String(),
    }),
    response: {
      201: t.Object(
        {
          message: t.String(),
          client: t.Object({
            type: t.String(),
            email_address: t.String(),
            name: t.String(),
            company_name: t.String(),
            cpf: t.String(),
            cnpj: t.String(),
            phone: t.String(),
            cep: t.String(),
            address: t.String(),
            address_number: t.String(),
            neighborhood: t.String(),
            state: t.String(),
            city: t.String(),
          }),
        },
        {
          description: "Cliente cadastrado com sucesso",
        }
      ),
      400: t.Object(
        {
          code: t.String(),
          message: t.String(),
        },
        {
          description: "Cliente já cadastrado",
        }
      ),
      401: t.Object(
        {
          code: t.String(),
          message: t.String(),
        },
        {
          description: "Unauthorized",
        }
      ),
      404: t.Object(
        {
          code: t.String(),
          message: t.String(),
        },
        {
          description: "Company not found",
        }
      ),
    },
    detail: {
      description: "Register a new client (individual or corporate)",
      tags: ["Clients"],
    },
  }
)
