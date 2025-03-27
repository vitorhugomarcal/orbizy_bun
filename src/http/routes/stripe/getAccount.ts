import Elysia, { t } from "elysia"
import Stripe from "stripe"
import { env } from "../../../env"
import { auth } from "../../authentication"
import { AuthError } from "../errors/auth-error"

export const getAccount = new Elysia().get(
  `/stripe/:accountId`,
  async ({ cookie, params }) => {
    const stripe = new Stripe(env.STRIPE_SECRET_KEY)

    const { accountId } = params

    if (!accountId) {
      throw new AuthError("Account ID not provided", "ACCOUNT", 400)
    }

    const user = await auth({ cookie })
    if (!user) {
      throw new AuthError("Unauthorized", "UNAUTHORIZED", 401)
    }

    const response = await stripe.accounts.listPersons(accountId)

    console.log(response)

    return {
      message: "Empresa cadastrada com sucesso",
      person: response,
    }
  },
  {
    response: {
      200: t.Object(
        {
          message: t.String(),
          person: t.Array(
            t.Object({
              id: t.String(),
              status: t.String(),
            })
          ),
        },
        {
          description: "Stripe Company created successfully",
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
          description: "Item já cadastrado",
        }
      ),
    },
    detail: {
      description: "Create a new stripe company",
      tags: ["Stripe"],
    },
  }
)

// Funções de validação (implemente a lógica completa)
function isValidCPF(cpf: string): boolean {
  cpf = cpf.replace(/[^\d]/g, "")
  if (cpf.length !== 11) return false
  // Implementar lógica completa de validação de CPF
  return true
}

function isValidCNPJ(cnpj: string): boolean {
  cnpj = cnpj.replace(/[^\d]/g, "")
  if (cnpj.length !== 14) return false
  // Implementar lógica completa de validação de CNPJ
  return true
}
