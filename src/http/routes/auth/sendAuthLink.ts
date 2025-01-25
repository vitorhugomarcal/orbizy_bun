import { createId } from "@paralleldrive/cuid2"
import Elysia, { t } from "elysia"
import { Resend } from "resend"
import { env } from "../../../env"
import { db } from "../../../lib/prisma"
import { AuthError } from "../errors/auth-error"

const RESEND_API = env.RESEND_API
const JWT_SECRET = env.JWT_SECRET
const API_BASE_URL = env.API_BASE_URL || "http://192.168.1.80:5173"
const AUTH_REDIRECT_URL = env.AUTH_REDIRECT_URL || "http://192.168.1.80:5173"

const MAGIC_LINK_EXPIRATION = 15 * 60 * 1000 // 15 minutes in milliseconds

const resend = new Resend(RESEND_API)

async function createMagicLinkEmail(
  email: string,
  magicLink: URL
): Promise<void> {
  await resend.emails.send({
    from: "no-reply@update.ipsec.com.br",
    to: email,
    subject: "Seu link de acesso",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Seu link de acesso</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #2563eb;">Seu link de acesso</h1>
            <p>Olá! Você solicitou um link de acesso para sua conta.</p>
            <p>Clique no botão abaixo para acessar sua conta:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${magicLink}" 
                 style="background-color: #2563eb; color: white; padding: 12px 24px; 
                        text-decoration: none; border-radius: 4px; display: inline-block;">
                Acessar conta
              </a>
            </div>
            <p style="color: #666; font-size: 14px;">
              Este link expira em 15 minutos por motivos de segurança.
              Se você não solicitou este link, por favor ignore este email.
            </p>
            <hr style="border: 1px solid #eee; margin: 20px 0;">
            <p style="color: #666; font-size: 12px;">
              Este é um email automático. Por favor não responda.
            </p>
          </div>
        </body>
      </html>
    `,
  })
}

export const sendAuthLink = new Elysia().post(
  "/auth/magic-link",
  async ({ body }) => {
    const { email } = body

    const recentAttempt = await db.authLinks.findFirst({
      where: {
        user: { email },
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

    const userExists = await db.user.findUnique({ where: { email } })

    if (!userExists) {
      throw new AuthError("Email não encontrado", "USER_NOT_FOUND", 404)
    }

    await db.authLinks.deleteMany({
      where: {
        user_id: userExists.id,
        createdAt: {
          lt: new Date(Date.now() - MAGIC_LINK_EXPIRATION),
        },
      },
    })

    const authLinkCode = createId()

    await db.authLinks.create({
      data: {
        user_id: userExists.id,
        code: authLinkCode,
        expiresAt: new Date(Date.now() + MAGIC_LINK_EXPIRATION),
      },
    })

    // Generate magic link
    const magicLink = new URL("/auth/verify", API_BASE_URL)
    magicLink.searchParams.set("code", authLinkCode)
    magicLink.searchParams.set("redirect", AUTH_REDIRECT_URL)

    // Send email
    await createMagicLinkEmail(email, magicLink)

    console.info(`Magic link sent successfully to ${email}`)
  },
  {
    body: t.Object({
      email: t.String({ format: "email" }),
    }),
  }
)
