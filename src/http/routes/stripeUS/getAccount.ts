import Elysia, { t } from "elysia"
import Stripe from "stripe"
import { env } from "../../../env"
import { auth } from "../../authentication"
import { AuthError } from "../errors/auth-error"

export const getAccount = new Elysia().get(
  `/stripe/us/:accountId`,
  async ({ cookie, params }) => {
    const stripe = new Stripe(env.STRIPE_US_SECRET_KEY)

    const { accountId } = params

    if (!accountId) {
      throw new AuthError("Account ID not provided", "ACCOUNT", 400)
    }

    const user = await auth({ cookie })
    if (!user) {
      throw new AuthError("Unauthorized", "UNAUTHORIZED", 401)
    }

    const response = await stripe.accounts.listPersons(accountId)

    const account = await stripe.accounts.retrieve(accountId)

    return {
      message: "Empresa cadastrada com sucesso",
      person: response.data,
      account,
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
            })
          ),
          account: t.Object({
            id: t.String(),
            email: t.String(),
            login_links: t.Object({
              url: t.String(),
            }),
          }),
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
      description: "Get account stripe company",
      tags: ["StripeUS"],
    },
  }
)
