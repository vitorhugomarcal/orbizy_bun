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
      phone,
      cpf,
      ssn,
      cnpj,
      ein,
      address: {
        country,
        state,
        city,
        neighborhood,
        postal_code,
        street,
        number,
        street_address,
        unit_number,
      },
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

    await db.address.update({
      where: {
        id: clientExists.address_id,
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
        ssn,
        ein,
        phone,
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
      ssn: t.Nullable(t.Optional(t.String())),
      ein: t.Nullable(t.Optional(t.String())),
      address: t.Object({
        country: t.Optional(t.String()),
        state: t.Optional(t.String()),
        city: t.Optional(t.String()),
        postal_code: t.Optional(t.String()),
        neighborhood: t.Nullable(t.Optional(t.String())),
        street: t.Nullable(t.Optional(t.String())),
        number: t.Nullable(t.Optional(t.String())),
        street_address: t.Nullable(t.Optional(t.String())),
        unit_number: t.Nullable(t.Optional(t.String())),
      }),
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
            ssn: t.Nullable(t.String()),
            ein: t.Nullable(t.String()),
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
