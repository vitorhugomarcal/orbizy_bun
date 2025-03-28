import Elysia, { t } from "elysia"
import Stripe from "stripe"
import { env } from "../../../env"
import { db } from "../../../lib/prisma"
import { auth } from "../../authentication"
import { AuthError } from "../errors/auth-error"

export const registerCompany = new Elysia().post(
  `/stripe/create/:companyId`,
  async ({ cookie, body, params }) => {
    const stripe = new Stripe(env.STRIPE_SECRET_KEY)

    const { name, email, taxId, country } = body
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

    let accountParams: Stripe.AccountCreateParams = {
      type: "express",
      email,
      country,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    }

    if (country === "BR") {
      const cleanTaxId = taxId.replace(/[^\d]/g, "")
      const isIndividual = cleanTaxId.length === 11
      const isCompany = cleanTaxId.length === 14

      if (!isIndividual && !isCompany) {
        throw new AuthError("CPF ou CNPJ inválido", "INVALID_TAX_ID", 400)
      }

      if (isIndividual && !isValidCPF(cleanTaxId)) {
        throw new AuthError("CPF inválido", "INVALID_CPF", 400)
      } else if (isCompany && !isValidCNPJ(cleanTaxId)) {
        throw new AuthError("CNPJ inválido", "INVALID_CNPJ", 400)
      }

      accountParams.capabilities = {
        ...accountParams.capabilities,
        boleto_payments: { requested: true },
        // pix_payments: { requested: true },
      }

      if (isIndividual) {
        accountParams = {
          ...accountParams,
          business_type: "individual",
          individual: {
            first_name: name.split(" ")[0],
            last_name: name.split(" ").slice(1).join(" "),
            email: email,
            id_number: cleanTaxId,
          },
        }
      } else {
        accountParams = {
          ...accountParams,
          business_type: "company",
          company: {
            name,
            tax_id: cleanTaxId,
          },
          business_profile: {
            url: "https://orbizy.app",
          },
        }
      }
    } else if (country === "US") {
      // Para os EUA, geralmente usamos SSN para indivíduos e EIN para empresas
      accountParams = {
        ...accountParams,
        business_type: "company", // ou "individual" dependendo do caso
        company: {
          name,
          tax_id: taxId, // EIN para empresas
        },
        business_profile: {
          url: "https://orbizy.app",
        },
      }

      accountParams.capabilities = {
        ...accountParams.capabilities,
        // ach_direct_debits: { requested: true },
      }
    } else {
      throw new AuthError("País não suportado", "UNSUPPORTED_COUNTRY", 400)
    }

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
        country === "BR"
          ? accountParams.business_type === "individual"
            ? "Pessoa física cadastrada com sucesso"
            : "Empresa cadastrada com sucesso"
          : "Company registered successfully",
      companyId: company.id,
      stripeAccountId: account.id,
      onboardingUrl: accountLink.url,
    }
  },
  {
    body: t.Object({
      name: t.String(),
      email: t.String(),
      taxId: t.String(),
      country: t.String(),
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
          description: "Invalid input",
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
  // Implemente a lógica completa de validação de CPF
  return true
}

function isValidCNPJ(cnpj: string): boolean {
  // Implemente a lógica completa de validação de CNPJ
  return true
}
