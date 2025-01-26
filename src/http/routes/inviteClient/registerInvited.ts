import Elysia, { t } from "elysia"
import { db } from "../../../lib/prisma"
import { AuthError } from "../errors/auth-error"

export const registerInvited = new Elysia().post(
  `/invited/client/register`,
  async ({ body }) => {
    const {
      code,
      type,
      email_address,
      name,
      company_name,
      cpf,
      cnpj,
      phone,
      cep,
      address,
      address_number,
      neighborhood,
      state,
      city,
    } = body

    // Verificar se o código do convite existe e é válido
    const inviteLink = await db.inviteLinks.findFirst({
      where: {
        code,
        expiresAt: {
          gte: new Date(),
        },
      },
      include: {
        company: true,
      },
    })

    if (!inviteLink) {
      throw new AuthError(
        "Código de convite inválido ou expirado",
        "INVALID_INVITE_CODE",
        400
      )
    }

    const existingClient = await db.client.findFirst({
      where: {
        company_id: inviteLink.company_id,
        OR: [
          { email_address },
          { cpf: cpf || undefined },
          { cnpj: cnpj || undefined },
        ],
      },
    })

    if (existingClient) {
      throw new AuthError("Cliente já cadastrado", "CLIENT_ALREADY_EXISTS", 400)
    }

    const client = await db.client.create({
      data: {
        company_id: inviteLink.company_id,
        type,
        email_address,
        name,
        company_name: type === "jurídica" ? company_name : null,
        cpf: type === "física" ? cpf : null,
        cnpj: type === "jurídica" ? cnpj : null,
        phone,
        cep,
        address,
        address_number,
        neighborhood,
        state,
        city,
      },
    })

    await db.inviteLinks.delete({
      where: {
        id: inviteLink.id,
      },
    })

    return {
      message: "Cliente cadastrado com sucesso",
      client,
    }
  },
  {
    body: t.Object({
      code: t.String(),
      type: t.String(),
      email_address: t.String(),
      name: t.String(),
      company_name: t.String(),
      cpf: t.String(),
      cnpj: t.String(),
      phone: t.String(),
      cep: t.String(),
      address: t.String(),
      address_number: t.String(),
      neighborhood: t.String(),
      state: t.String(),
      city: t.String(),
    }),
    response: {
      201: t.Object(
        {
          message: t.String(),
          client: t.Object({
            id: t.String(),
            type: t.String(),
            email_address: t.String(),
            name: t.String(),
            company_name: t.String(),
            cpf: t.String(),
            cnpj: t.String(),
            phone: t.String(),
            cep: t.String(),
            address: t.String(),
            address_number: t.String(),
            neighborhood: t.String(),
            state: t.String(),
            city: t.String(),
          }),
        },
        {
          description: "Cliente cadastrado com sucesso",
        }
      ),
      400: t.Object(
        {
          message: t.String(),
        },
        {
          description: "Cliente já cadastrado",
        }
      ),
    },
    detail: {
      description: "Registrar um novo cliente",
      tags: ["Invite"],
    },
  }
)
