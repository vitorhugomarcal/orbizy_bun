import Elysia, { t } from "elysia"
import { db } from "../../../lib/prisma"
import { auth } from "../../authentication"
import { AuthError } from "../errors/auth-error"

// Validation types for request body
const ClientCreateBody = t.Object({
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
})

// Response types
const ResponseTypes = {
  201: t.Object(
    { message: t.String() },
    { description: "Cliente criado com sucesso" }
  ),
  400: t.Object(
    { message: t.String() },
    { description: "Dados inválidos ou cliente já existe" }
  ),
  401: t.Object({ message: t.String() }, { description: "Não autorizado" }),
  404: t.Object(
    { message: t.String() },
    { description: "Empresa não encontrada" }
  ),
}

export const createClient = new Elysia().post(
  "/client/create",
  async ({ cookie, body }) => {
    // Authenticate user
    const user = await auth({ cookie })
    if (!user) {
      throw new AuthError("Não autorizado", "UNAUTHORIZED", 401)
    }

    // Verify company association
    if (!user.Company) {
      throw new AuthError("Empresa não encontrada", "COMPANY_NOT_FOUND", 404)
    }

    // Check for existing client with same email, CPF, or CNPJ
    const existingClient = await db.client.findFirst({
      where: {
        company_id: user.Company.id,
        OR: [
          { email_address: body.email_address },
          { cpf: body.cpf || undefined },
          { cnpj: body.cnpj || undefined },
        ],
      },
    })

    if (existingClient) {
      throw new AuthError(
        "Cliente já cadastrado no sistema",
        "CLIENT_ALREADY_EXISTS",
        400
      )
    }

    // Validate required fields based on client type
    if (body.type === "PF" && !body.cpf) {
      throw new AuthError(
        "CPF é obrigatório para pessoa física",
        "INVALID_DATA",
        400
      )
    }

    if (body.type === "PJ" && !body.cnpj) {
      throw new AuthError(
        "CNPJ é obrigatório para pessoa jurídica",
        "INVALID_DATA",
        400
      )
    }

    // Create new client
    await db.client.create({
      data: {
        company_id: user.Company.id,
        type: body.type,
        email_address: body.email_address,
        name: body.name,
        company_name: body.company_name,
        cpf: body.cpf,
        cnpj: body.cnpj,
        phone: body.phone,
        cep: body.cep,
        address: body.address,
        address_number: body.address_number,
        neighborhood: body.neighborhood,
        state: body.state,
        city: body.city,
      },
    })

    return {
      message: "Cliente cadastrado com sucesso",
    }
  },
  {
    body: ClientCreateBody,
    response: ResponseTypes,
    detail: {
      description: "Cadastra um novo cliente (pessoa física ou jurídica)",
      tags: ["Clients"],
    },
  }
)
