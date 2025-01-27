import Elysia, { t } from "elysia"
import { db } from "../../../lib/prisma"
import { auth } from "../../authentication"
import { AuthError } from "../errors/auth-error"

export const getAll = new Elysia().get(
  "/clients",
  async ({ cookie }) => {
    const user = await auth({ cookie })
    if (!user) {
      throw new AuthError("Unauthorized", "UNAUTHORIZED", 401)
    }

    const hasCompany = user.Company

    if (!hasCompany) {
      throw new AuthError("Company not found", "COMPANY_NOT_FOUND", 401)
    }

    const clients = await db.client.findMany({
      where: {
        company_id: hasCompany.id,
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
        { description: "Invalid credentials" }
      ),
      404: t.Object(
        {
          message: t.String(),
        },
        { description: "No clients found" }
      ),
    },
    detail: {
      description: "Retrieve all clients",
      tags: ["Clients"],
    },
  }
)
