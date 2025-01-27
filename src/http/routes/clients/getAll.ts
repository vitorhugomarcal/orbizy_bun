import Elysia, { t } from "elysia"
import { db } from "../../../lib/prisma"
import { auth } from "../../authentication"
import { AuthError } from "../errors/auth-error"

export const getAll = new Elysia().get(
  "/clients/all",
  async ({ cookie }) => {
    const user = await auth({ cookie })
    if (!user) {
      throw new AuthError("Unauthorized", "UNAUTHORIZED", 401)
    }

    const hasCompany = user.Company

    if (!hasCompany) {
      throw new AuthError("Company not found", "COMPANY_NOT_FOUND", 404)
    }

    const clients = await db.client.findMany({
      where: {
        company_id: hasCompany.id,
      },
    })

    console.log(clients)

    if (!clients) {
      throw new AuthError(
        "Clientes não encontrados",
        "ESTIMATES_NOT_FOUND",
        404
      )
    }

    return {
      message: "Clientes encontrados",
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
              cpf: t.String(),
              cnpj: t.String(),
              name: t.String(),
              company_name: t.String(),
              email_address: t.String(),
              phone: t.String(),
              cep: t.String(),
              address: t.String(),
              address_number: t.String(),
              neighborhood: t.String(),
              city: t.String(),
              state: t.String(),
              createdAt: t.String(),
              company_id: t.String(),
            })
          ),
        },
        {
          description: "Orçamentos encontrados",
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
          description: "Orçamentos não encontrados",
        }
      ),
    },
    detail: {
      description: "Get all clients",
      tags: ["Clients"],
    },
  }
)
