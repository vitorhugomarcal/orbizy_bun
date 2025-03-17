import Elysia, { t } from "elysia"
import Stripe from "stripe"
import { env } from "../../../env"
import { db } from "../../../lib/prisma"
import { auth } from "../../authentication"
import { AuthError } from "../errors/auth-error"

export const registerCompany = new Elysia().post(
  `/stripe/create/:companyId`,
  async ({ cookie, body, params }) => {
    const stripe = new Stripe(env.STRIPE_PUBLISHABLE_KEY)

    const { name, email, taxId } = body
    const { companyId } = params

    if (!companyId) {
      throw new AuthError("Company ID not provided", "MISSING_COMPANY_ID", 400)
    }

    const myCompany = await db.company.findUnique({
      where: {
        id: companyId,
      },
    })

    const user = await auth({ cookie })
    if (!user) {
      throw new AuthError("Unauthorized", "UNAUTHORIZED", 401)
    }

    const checkUnitExists = await db.unitType.findFirst({
      where: {
        name,
      },
    })

    if (checkUnitExists) {
      throw new AuthError("Item já cadastrado", "ITEM_ALREADY_EXISTS", 400)
    }

    const account = await stripe.accounts.create({
      type: "express",
      country: "BR",
      email,
      business_type: "company",
      business_profile: {
        url: "https://orbizy.app",
      },
      company: {
        name,
        tax_id: taxId,
      },
      capabilities: {
        card_payments: {
          requested: true,
        },
        transfers: {
          requested: true,
        },
      },
    })

    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: "https://orbizy.app/dashboard/settings",
      return_url: "https://orbizy.app/dashboard/settings",
      type: "account_onboarding",
    })

    await db.company.update({
      where: {
        id: myCompany?.id,
      },
      data: {
        // stripeAccountId: account.id,
      },
    })

    return {
      message: "Unidade cadastrado com sucesso",
    }
  },
  {
    body: t.Object({
      name: t.String(),
      email: t.String(),
      taxId: t.String(),
    }),
    response: {
      201: t.Object(
        {
          message: t.String(),
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
