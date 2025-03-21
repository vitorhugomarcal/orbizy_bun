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
        address: true,
        estimate: true,
      },
    })

    if (!client) {
      throw new AuthError("Cliente não encontrado", "CLIENT_NOT_FOUND", 404)
    }

    const formattedClients = {
      ...client,
      estimate: client.estimate.map((est) => ({
        ...est,
        total: Number(est.total),
        sub_total: Number(est.sub_total),
      })),
    }

    return {
      message: "Cliente encontrado",
      client: formattedClients,
    }
  },

  {
    params: t.Object({
      clientId: t.String(),
    }),
    response: {
      200: t.Object(
        {
          message: t.String(),
          client: t.Object({
            id: t.String(),
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
              country: t.String(),
              state: t.String(),
              city: t.String(),
              postal_code: t.String(),
              street: t.Nullable(t.String()),
              number: t.Nullable(t.String()),
              neighborhood: t.Nullable(t.String()),
              street_address: t.Nullable(t.String()),
              unit_number: t.Nullable(t.String()),
            }),
            estimate: t.Array(
              t.Object({
                id: t.String(),
                estimate_number: t.Nullable(t.String()),
                status: t.Nullable(t.String()),
                notes: t.Nullable(t.String()),
                sub_total: t.Nullable(t.Number()),
                total: t.Nullable(t.Number()),
                createdAt: t.Date(),
              })
            ),
          }),
        },
        {
          description: "Cliente encontrado",
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
      400: t.Object(
        {
          message: t.String(),
        },
        {
          description: "ID do cliente não fornecido",
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
    },
    detail: {
      description: "Retrieve client by ID",
      tags: ["Clients"],
    },
  }
)
