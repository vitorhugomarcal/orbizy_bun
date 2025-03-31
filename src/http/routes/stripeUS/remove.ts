import Elysia, { t } from "elysia"
import Stripe from "stripe"
import { env } from "../../../env"
import { db } from "../../../lib/prisma"
import { auth } from "../../authentication"
import { AuthError } from "../errors/auth-error"

export const removeStripe = new Elysia().delete(
  `/stripe/us/remove/:stripeId`,
  async ({ cookie, params }) => {
    const stripe = new Stripe(env.STRIPE_US_SECRET_KEY)

    const user = await auth({ cookie })

    if (!user?.company_id) {
      throw new AuthError("Unauthorized", "UNAUTHORIZED", 401)
    }

    const { stripeId } = params

    if (!stripeId) {
      throw new AuthError("Conta não encontrada", "ACCOUNT_ID_NOT_FOUND", 404)
    }

    await db.company.update({
      data: {
        stripeAccountId: null,
      },
      where: {
        id: user.company_id,
      },
    })

    await stripe.accounts.del(stripeId)

    return {
      message: "Conta removida com sucesso",
    }
  },
  {
    params: t.Object({
      stripeId: t.String(),
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
      tags: ["StripeUS"],
    },
  }
)
