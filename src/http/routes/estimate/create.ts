import Elysia, { t } from "elysia"
import { db } from "../../../lib/prisma"
import { auth } from "../../authentication"
import { AuthError } from "../errors/auth-error"

export const createEstimate = new Elysia().post(
  `/estimate/create/:clientId`,
  async ({ cookie, params }) => {
    const user = await auth({ cookie })
    if (!user) {
      throw new AuthError("Unauthorized", "UNAUTHORIZED", 401)
    }
    const hasCompany = user.Company

    if (!hasCompany) {
      throw new AuthError("Company not found", "COMPANY_NOT_FOUND", 404)
    }

    const { clientId } = params

    if (!clientId) {
      throw new AuthError("Client ID not provided", "MISSING_CLIENT_ID", 400)
    }

    const checkClientExists = await db.client.findUnique({
      where: {
        id: clientId,
      },
    })

    if (!checkClientExists) {
      throw new AuthError("Client not found", "CLIENT_NOT_FOUND", 404)
    }

    console.log(clientId)

    const estimate = await db.estimate.create({
      data: {
        company_id: hasCompany.id,
        client_id: clientId,
      },
    })

    return {
      message: "Orçamento cadastrado com sucesso",
      estimate,
    }
  },
  {
    params: t.Object({
      clientId: t.String(),
    }),
    response: {
      201: t.Object(
        {
          message: t.String(),
          estimate: t.Object({
            id: t.String(),
          }),
        },
        {
          description: "Orçamento cadastrado com sucesso",
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
          description: "Client not found",
        }
      ),
    },
    detail: {
      description: "Create a new estimate",
      tags: ["Estimate"],
    },
  }
)
