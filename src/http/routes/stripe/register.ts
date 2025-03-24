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

    const { name, email, taxId } = body
    const { companyId } = params

    console.log("body stripe", name, email, taxId)

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

    const client = await db.client.findFirst({
      where: {
        OR: [{ cpf: taxId }, { cnpj: taxId }, { ssn: taxId }, { ein: taxId }],
      },
    })

    const cleanTaxId = taxId.replace(/[^\d]/g, "")

    const isIndividual = client?.type === "pf" || client?.type === "pfUS"

    let accountParams: Stripe.AccountCreateParams = {
      type: "express",
      country: user.country === "BR" ? "BR" : "US",
      email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
        ...(user.country === "BR"
          ? { boleto_payments: { requested: true } }
          : {}),
      },
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
      message: isIndividual
        ? "Pessoa física cadastrada com sucesso"
        : "Empresa cadastrada com sucesso",
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
