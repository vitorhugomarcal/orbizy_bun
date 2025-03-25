import Elysia, { t } from "elysia"
import { auth } from "../../authentication"
import { app } from "../../server"
import { AuthError } from "../errors/auth-error"

interface Headers {
  Authorization: string
  [key: string]: string
}

export const createPreferences = new Elysia().post(
  `/mp/create-preference`,
  async ({ cookie, body }) => {
    const { items, payer } = body

    const user = await auth({ cookie })
    if (!user) {
      throw new AuthError("Unauthorized", "UNAUTHORIZED", 401)
    }

    const access_token = user.mp_at

    if (!access_token) {
      throw new AuthError("Access token not found", "MISSING_ACCESS_TOKEN", 400)
    }

    const hasCompany = user.Company

    if (!hasCompany) {
      throw new AuthError("Company not found", "COMPANY_NOT_FOUND", 404)
    }

    const headers: Headers = {
      Authorization: `Bearer ${access_token}`,
    }

    try {
      const response = await app.post(
        "https://api.mercadopago.com/checkout/preferences",
        {
          items,
          payer,
        },
        { headers }
      )

      console.log(response)

      // Aqui você deve armazenar o token de acesso de forma segura
      // Por exemplo, em um banco de dados associado ao usuário
      // const { access_token, refresh_token, user_id } = data

      // Por segurança, não retorne o access_token diretamente para o cliente
      return {
        message: "Success",
        // user_id,
      }
    } catch (error) {
      console.error("Erro ao trocar o código pelo token")
      return {
        message: "Error ao processar a solicitação",
      }
    }
  },

  {
    body: t.Object({
      items: t.String(),
      payer: t.String(),
    }),
    response: {
      201: t.Object(
        {
          message: t.String(),
          // user_id: t.String(),
        },
        {
          description: "Fatura cadastrada com sucesso",
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
          description: "Fatura já cadastrada",
        }
      ),
      404: t.Object(
        {
          message: t.String(),
        },
        {
          description: "Company not found",
        }
      ),
    },
    detail: {
      description: "Preferences",
      tags: ["MercadoPago"],
    },
  }
)
