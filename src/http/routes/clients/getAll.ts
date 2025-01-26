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
        estimate: true,
      },
    })
    return {
      message: "Clients retrieved successfully",
      description: "Get all clients",
      clients,
    }
  },
  {
    response: {
      200: t.Object({
        message: t.String(),
        description: t.String(),
        clients: t.Array(
          t.Object({
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
          })
        ),
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
