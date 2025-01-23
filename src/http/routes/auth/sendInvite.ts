import { createId } from "@paralleldrive/cuid2"
import Elysia, { t } from "elysia"
import { env } from "../../../env"
import { db } from "../../../lib/prisma"

class AuthError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number
  ) {
    super(message)
    this.name = "AuthError"
  }
}

const AUTH_REDIRECT_URL = env.AUTH_REDIRECT_URL || "http://192.168.1.80:5173"

const LINK_EXPIRATION = 48 * 60 * 60 * 1000 // 2 days in milliseconds

export const sendInviteLink = new Elysia().post(
  `/invite/client/:companyId`,
  async ({ params }) => {
    const { companyId } = params

    const recentAttempt = await db.inviteLinks.findFirst({
      where: {
        company_id: companyId,
        createdAt: {
          gte: new Date(Date.now() - 60000), // 1 minute ago
        },
      },
    })

    if (recentAttempt) {
      throw new AuthError(
        "Por favor aguarde um minuto antes de solicitar um novo link",
        "RATE_LIMITED",
        429
      )
    }

    const companyExists = await db.company.findUnique({
      where: { id: companyId },
    })

    if (!companyExists) {
      throw new AuthError("Empresa não encontrada", "COMPANY_NOT_FOUND", 404)
    }

    const authLinkCode = createId()

    await db.inviteLinks.create({
      data: {
        company_id: companyExists.id,
        code: authLinkCode,
        expiresAt: new Date(Date.now() + LINK_EXPIRATION),
      },
    })

    // Generate magic link
    const inviteLink = new URL("/invitedClient", AUTH_REDIRECT_URL)
    inviteLink.searchParams.set("code", authLinkCode)

    console.log(inviteLink)
    return inviteLink
  },
  {
    params: t.Object({
      companyId: t.String(),
    }),
  }
)
