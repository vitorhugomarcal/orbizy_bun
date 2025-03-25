import Elysia, { t } from "elysia"
import { auth } from "../../authentication"
import { app } from "../../server"
import { AuthError } from "../errors/auth-error"

export const exchangeToken = new Elysia().post(
  `/mp/exchange-token`,
  async ({ cookie, body }) => {
    const { code } = body

    console.log("CODE MP", code)

    const user = await auth({ cookie })
    if (!user) {
      throw new AuthError("Unauthorized", "UNAUTHORIZED", 401)
    }

    if (!code) {
      throw new AuthError("Code not provided", "MISSING_CODE", 400)
    }

    const hasCompany = user.Company

    if (!hasCompany) {
      throw new AuthError("Company not found", "COMPANY_NOT_FOUND", 404)
    }

    try {
      const response = await app.post(
        "https://api.mercadopago.com/oauth/token",
        {
          client_secret: process.env.MERCADO_PAGO_CLIENT_SECRET,
          client_id: process.env.MERCADO_PAGO_CLIENT_ID,
          grant_type: "authorization_code",
          code: code,
          redirect_uri: process.env.MERCADO_PAGO_REDIRECT_URI,
        }
      )

      // Aqui você deve armazenar o token de acesso de forma segura
      // Por exemplo, em um banco de dados associado ao usuário
      // const { access_token, refresh_token, user_id } = data

      console.log(response)

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
      code: t.String(),
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
      description: "Cadastra uma nova fatura",
      tags: ["Stripe"],
    },
  }
)
