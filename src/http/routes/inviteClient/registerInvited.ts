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
      phone,
      cpf,
      cnpj,
      state,
      city,
      neighborhood,
      ssn,
      ein,
      country,
      postal_code,
      street,
      number,
      street_address,
      unit_number,
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

    const address = await db.address.create({
      data: {
        country,
        state,
        city,
        neighborhood,
        postal_code,
        street,
        number,
        street_address,
        unit_number,
      },
    })

    const client = await db.client.create({
      data: {
        company_id: inviteLink.company_id,
        type,
        email_address,
        name,
        company_name: type === "jurídica" ? company_name : null,
        cpf: type === "física" ? cpf : null,
        cnpj: type === "jurídica" ? cnpj : null,
        ssn: type === "física" ? ssn : null,
        ein: type === "jurídica" ? ein : null,
        phone,
        address_id: address.id,
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
      company_name: t.Optional(t.String()),
      cpf: t.Optional(t.String()),
      cnpj: t.Optional(t.String()),
      ssn: t.Optional(t.String()),
      ein: t.Optional(t.String()),
      phone: t.String(),
      country: t.String(),
      state: t.String(),
      city: t.String(),
      postal_code: t.String(),
      street: t.Optional(t.String()),
      number: t.Optional(t.String()),
      neighborhood: t.Optional(t.String()),
      street_address: t.Optional(t.String()),
      unit_number: t.Optional(t.String()),
    }),
    response: {
      201: t.Object(
        {
          message: t.String(),
          id: t.String(),
          type: t.String(),
          email_address: t.String(),
          name: t.String(),
          company_name: t.Nullable(t.String()),
          cpf: t.Nullable(t.String()),
          cnpj: t.Nullable(t.String()),
          ssn: t.Nullable(t.String()),
          ein: t.Nullable(t.String()),
          phone: t.String(),
          address: t.Object({
            country: t.String(),
            state: t.String(),
            city: t.String(),
            postal_code: t.String(),
            street: t.Nullable(t.String()),
            number: t.Nullable(t.String()),
            neighborhood: t.Nullable(t.String()),
            street_address: t.Nullable(t.String()),
            unit_number: t.Nullable(t.String()),
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
