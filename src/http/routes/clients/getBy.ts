import Elysia, { t } from "elysia"
import { db } from "../../../lib/prisma"
import { auth } from "../../authentication"
import { AuthError } from "../errors/auth-error"

export const getBy = new Elysia().get(
  "/clients/:clientId",
  async ({ cookie, params }) => {
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

    const client = await db.client.findUnique({
      where: {
        id: clientId,
      },
      include: {
        estimate: true,
      },
    })

    if (!client) {
      throw new AuthError("Cliente não encontrado", "CLIENT_NOT_FOUND", 404)
    }

    return {
      message: "Cliente encontrado",
      description: "Retorna um cliente",
      client,
    }
  },

  {
    params: t.Object({
      clientId: t.String(),
    }),
    response: {
      200: t.Object({
        message: t.String(),
        description: t.String(),
        client: t.Object({
          id: t.String(),
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
          estimate: t.Array(
            t.Object({
              id: t.String(),
            })
          ),
        }),
      }),
      401: t.Object({
        error: t.String(),
        description: t.String(),
      }),
    },
    detail: {
      description: "Retrieve all clients",
      tags: ["Clients"],
    },
  }
)
