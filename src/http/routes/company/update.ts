import Elysia, { t } from "elysia"
import { db } from "../../../lib/prisma"
import { auth } from "../../authentication"
import { AuthError } from "../errors/auth-error"

export const update = new Elysia().put(
  `/company/update/:companyId`,
  async ({ cookie, body, params }) => {
    const { ein, cnpj, company_name, phone, address, stripeAccountId } = body

    const user = await auth({ cookie })
    if (!user) {
      throw new AuthError("Unauthorized", "UNAUTHORIZED", 401)
    }

    // Usar o companyId do parâmetro da URL em vez de assumir que o usuário tem uma empresa
    const companyId = params.companyId

    const company = await db.company.findUnique({
      where: { id: companyId },
      include: { address: true },
    })

    if (!company) {
      throw new AuthError("Company not found", "COMPANY_NOT_FOUND", 404)
    }

    // Verificar se o usuário é o proprietário da empresa
    if (company.owner_id !== user.id) {
      throw new AuthError("Unauthorized", "UNAUTHORIZED", 401)
    }

    // Atualizar o endereço se fornecido
    if (address) {
      await db.address.update({
        where: { id: company.address_id },
        data: {
          country: address.country,
          city: address.city,
          state: address.state,
          postal_code: address.postal_code,
          street: address.street,
          number: address.number,
          neighborhood: address.neighborhood,
          street_address: address.street_address,
          unit_number: address.unit_number,
        },
      })
    }

    // Atualizar a empresa
    const updatedCompany = await db.company.update({
      where: { id: companyId },
      data: {
        ein: ein ?? undefined,
        cnpj: cnpj ?? undefined,
        phone: phone ?? undefined,
        company_name: company_name ?? undefined,
        stripeAccountId: stripeAccountId ?? undefined,
      },
      include: { address: true },
    })

    return {
      message: "Empresa atualizada com sucesso",
      company: updatedCompany,
    }
  },
  {
    params: t.Object({
      companyId: t.String(),
    }),
    body: t.Object({
      ein: t.Optional(t.String()),
      cnpj: t.Optional(t.String()),
      phone: t.Optional(t.String()),
      company_name: t.Optional(t.String()),
      stripeAccountId: t.Optional(t.String()),
      address: t.Optional(
        t.Object({
          country: t.Optional(t.String()),
          city: t.Optional(t.String()),
          state: t.Optional(t.String()),
          postal_code: t.Optional(t.String()),
          street: t.Optional(t.String()),
          number: t.Optional(t.String()),
          neighborhood: t.Optional(t.String()),
          street_address: t.Optional(t.String()),
          unit_number: t.Optional(t.String()),
        })
      ),
    }),
    response: {
      200: t.Object(
        {
          message: t.String(),
          company: t.Object({
            id: t.String(),
            ein: t.Nullable(t.String()),
            cnpj: t.Nullable(t.String()),
            phone: t.String(),
            company_name: t.String(),
            owner_id: t.String(),
            stripeAccountId: t.Nullable(t.String()),
            address: t.Object({
              id: t.String(),
              country: t.String(),
              city: t.String(),
              state: t.String(),
              postal_code: t.String(),
              street: t.Nullable(t.String()),
              number: t.Nullable(t.String()),
              neighborhood: t.Nullable(t.String()),
              street_address: t.Nullable(t.String()),
              unit_number: t.Nullable(t.String()),
            }),
          }),
        },
        {
          description: "Empresa atualizada com sucesso",
        }
      ),
      400: t.Object(
        {
          message: t.String(),
        },
        {
          description: "Invalid request",
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
          description: "Company not found",
        }
      ),
    },
    detail: {
      description: "Update a company",
      tags: ["Company"],
    },
  }
)
