import Elysia, { t } from "elysia"
import { db } from "../../../lib/prisma"
import { auth, type CookieProps } from "../../authentication"
import { AuthError } from "../errors/auth-error"

export const getAll = new Elysia().get(
  "/clients",
  async ({ cookie }: CookieProps) => {
    const user = await auth({ cookie })
    if (!user) {
      throw new AuthError("Unauthorized", "UNAUTHORIZED", 401)
    }

    const clients = await db.client.findMany({
      where: {
        company_id: user.company_id,
      },
      include: {
        estimateClient: true,
      },
    })

    if (!clients) {
      throw new AuthError("Clients not found", "CLIENTS_NOT_FOUND", 404)
    }

    return {
      message: "Clients retrieved successfully",
      clients,
    }
  },
  {
    response: {
      200: t.Object(
        {
          message: t.String(),
          clients: t.Array(
            t.Object({
              id: t.String(),
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
              company_id: t.String(),
              created_at: t.String(),
              estimate: t.Array(
                t.Object({
                  id: t.String(),
                  status: t.String(),
                  sub_total: t.Number(),
                  total: t.Number(),
                })
              ),
            })
          ),
        },
        {
          description: "Clients retrieved successfully",
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
          description: "Clients not found",
        }
      ),
    },
    detail: {
      description: "Retrieve all clients",
      tags: ["Clients"],
    },
  }
)
