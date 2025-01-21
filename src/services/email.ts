import { Resend } from "resend"
import { env } from "../env"

const resend = new Resend(env.RESEND_API)

export const sendMagicLink = async (email: string, code: string) => {
  const magicLink = `${env.API_BASE_URL}/auth/verify?code=${code}&redirect=${env.AUTH_REDIRECT_URL}`

  await resend.emails.send({
    from: "auth@update.ipsec.com.br",
    to: email,
    subject: "Your Magic Link",
    html: `
      <h1>Login Link</h1>
      <p>Click the link below to login:</p>
      <a href="${magicLink}">Login to Your App</a>
    `,
  })
}
