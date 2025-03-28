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

    if (!companyId) {
      throw new AuthError(
        "ID da empresa não fornecido",
        "MISSING_COMPANY_ID",
        400
      )
    }

    const myCompany = await db.company.findUnique({
      where: {
        id: companyId,
      },
    })

    const user = await auth({ cookie })
    if (!user) {
      throw new AuthError("Não autorizado", "UNAUTHORIZED", 401)
    }

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

    let accountParams: Stripe.AccountCreateParams = {
      type: "express",
      country: "BR",
      email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
        boleto_payments: { requested: true },
        // pix_payments: { requested: true },
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
        message: isIndividual
          ? "Pessoa física cadastrada com sucesso"
          : "Empresa cadastrada com sucesso",
        companyId: company.id,
        stripeAccountId: account.id,
        onboardingUrl: accountLink.url,
      }
    } catch (error) {
      console.error("Erro ao criar conta Stripe:", error)
      throw new AuthError(
        "Erro ao criar conta Stripe",
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
          description: "Conta Stripe criada com sucesso",
        }
      ),
      401: t.Object(
        {
          message: t.String(),
        },
        {
          description: "Não autorizado",
        }
      ),
      400: t.Object(
        {
          message: t.String(),
        },
        {
          description: "Entrada inválida",
        }
      ),
      500: t.Object(
        {
          message: t.String(),
        },
        {
          description: "Erro interno do servidor",
        }
      ),
    },
    detail: {
      description: "Criar uma nova conta Stripe para empresa",
      tags: ["Stripe"],
    },
  }
)

function isValidCPF(cpf: string): boolean {
  // Implemente a lógica completa de validação de CPF
  // Este é um exemplo básico, você deve implementar a validação completa
  return cpf.length === 11
}

function isValidCNPJ(cnpj: string): boolean {
  // Implemente a lógica completa de validação de CNPJ
  // Este é um exemplo básico, você deve implementar a validação completa
  return cnpj.length === 14
}
