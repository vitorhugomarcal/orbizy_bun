import Elysia, { t } from "elysia"
import Stripe from "stripe"
import { env } from "../../../env"
import { db } from "../../../lib/prisma"
import { auth } from "../../authentication"
import { AuthError } from "../errors/auth-error"

export const registerUSCompany = new Elysia().post(
  `/stripe/create/us/:companyId`,
  async ({ cookie, body, params }) => {
    const stripe = new Stripe(env.STRIPE_US_SECRET_KEY)

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

    if (!isValidUSTaxId(taxId)) {
      throw new AuthError("Invalid Tax ID", "INVALID_TAX_ID", 400)
    }

    let accountParams: Stripe.AccountCreateParams = {
      type: "express",
      country: "US",
      email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    }

    if (taxId.length === 11) {
      accountParams = {
        ...accountParams,
        business_type: "individual",
        individual: {
          first_name: name.split(" ")[0],
          last_name: name.split(" ").slice(1).join(" "),
          email: email,
          ssn_last_4: taxId.slice(-4), // Apenas os últimos 4 dígitos do SSN
        },
      }
    } else {
      accountParams = {
        ...accountParams,
        business_type: "company",
        company: {
          name,
          tax_id: taxId, // EIN completo para empresas
        },
        business_profile: {
          url: "https://orbizy.app",
          mcc: "5734", // Código MCC para software/computador, ajuste conforme necessário
        },
      }
    }

    try {
      const account = await stripe.accounts.create(accountParams)

      const accountLink = await stripe.accountLinks.create({
        account: account.id,
        refresh_url: "https://orbizy.app",
        return_url: "https://api.orbizy.app/redirect",
        type: "account_onboarding",
      })

      const company = await db.company.update({
        where: {
          id: myCompany?.id,
        },
        data: {
          stripeAccountId: account.id,
        },
      })

      return {
        message:
          taxId.length === 11
            ? "Individual successfully registered"
            : "Company successfully registered",
        companyId: company.id,
        stripeAccountId: account.id,
        onboardingUrl: accountLink.url,
      }
    } catch (error) {
      console.error("Error creating US Stripe account:", error)
      throw new AuthError(
        "Error creating US Stripe account",
        "STRIPE_ACCOUNT_CREATION_ERROR",
        500
      )
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
          companyId: t.String(),
          stripeAccountId: t.String(),
          onboardingUrl: t.String(),
        },
        {
          description: "US Stripe Account created successfully",
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
          description: "Invalid input",
        }
      ),
      500: t.Object(
        {
          message: t.String(),
        },
        {
          description: "Internal server error",
        }
      ),
    },
    detail: {
      description: "Create a new US Stripe account for a company",
      tags: ["Stripe"],
    },
  }
)

function isValidUSTaxId(taxId: string): boolean {
  if (taxId.length === 11) {
    // Validação básica para SSN (9 dígitos)
    return /^\d{9}$/.test(taxId)
  } else {
    // Validação básica para EIN (9 dígitos, geralmente no formato XX-XXXXXXX)
    return /^\d{2}-?\d{7}$/.test(taxId)
  }
}
