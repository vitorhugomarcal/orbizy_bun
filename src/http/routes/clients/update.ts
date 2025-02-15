import Elysia, { t } from "elysia"
import { db } from "../../../lib/prisma"
import { auth } from "../../authentication"
import { AuthError } from "../errors/auth-error"

export const update = new Elysia().put(
  `/client/update/:clientId`,
  async ({ cookie, body, params }) => {
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

    const { clientId } = params

    if (!clientId) {
      throw new AuthError(
        "ID do cliente não fornecido",
        "MISSING_CLIENT_ID",
        400
      )
    }

    const clientExists = await db.client.findUnique({
      where: {
        id: clientId,
      },
    })

    if (!clientExists) {
      throw new AuthError("Cliente não encontrado", "CLIENT_NOT_FOUND", 404)
    }

    const client = await db.client.update({
      where: {
        id: clientId,
      },
      data: {
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
      },
    })

    return {
      message: "Cliente atualizado com sucesso",
      client,
    }
  },
  {
    body: t.Object({
      type: t.Optional(t.String()),
      email_address: t.Optional(t.String()),
      name: t.Optional(t.String()),
      company_name: t.Nullable(t.Optional(t.String())),
      cpf: t.Nullable(t.Optional(t.String())),
      cnpj: t.Nullable(t.Optional(t.String())),
      phone: t.Optional(t.String()),
      cep: t.Optional(t.String()),
      address: t.Optional(t.String()),
      address_number: t.Optional(t.String()),
      neighborhood: t.Optional(t.String()),
      state: t.Optional(t.String()),
      city: t.Optional(t.String()),
    }),
    response: {
      200: t.Object(
        {
          message: t.String(),
          client: t.Object({
            type: t.String(),
            email_address: t.String(),
            name: t.String(),
            company_name: t.Nullable(t.String()),
            cpf: t.Nullable(t.String()),
            cnpj: t.Nullable(t.String()),
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
          description: "Cliente atualizado com sucesso",
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
          description: "Cliente não encontrado",
        }
      ),
      400: t.Object(
        {
          message: t.String(),
        },
        {
          description: "Cliente já cadastrado",
        }
      ),
    },
    detail: {
      description: "Update client",
      tags: ["Clients"],
    },
  }
)
