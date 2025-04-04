import Elysia, { t } from "elysia"
import Stripe from "stripe"
import { env } from "../../../env"
import { auth } from "../../authentication"
import { AuthError } from "../errors/auth-error"

export const removeCustomers = new Elysia().delete(
  `/stripe/remove/customers/:customerId`,
  async ({ cookie, params }) => {
    const stripe = new Stripe(env.STRIPE_SECRET_KEY)

    const user = await auth({ cookie })

    if (!user?.company_id) {
      throw new AuthError("Unauthorized", "UNAUTHORIZED", 401)
    }

    const { customerId } = params

    if (!customerId) {
      throw new AuthError("Conta não encontrada", "ACCOUNT_ID_NOT_FOUND", 404)
    }

    await stripe.customers.del(customerId)

    return {
      message: "Conta removida com sucesso",
    }
  },
  {
    params: t.Object({
      customerId: t.String(),
    }),
    response: {
      204: t.Object(
        {
          message: t.String(),
        },
        {
          description: "Conta removida com sucesso",
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
          description: "Stripe ID não encontrado",
        }
      ),
    },
    detail: {
      description: "Remove uma conta",
      tags: ["Stripe"],
    },
  }
)
