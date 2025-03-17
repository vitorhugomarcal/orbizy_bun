import { z } from "zod"

const envSchema = z.object({
  NODE_ENV: z.enum(["dev", "production", "test"]).default("dev"),
  PORT: z.coerce.number().default(3333),
  JWT_SECRET: z.string(),
  RESEND_API: z.string(),
  DATABASE_URL: z.string(),
  AUTH_REDIRECT_URL: z.string(),
  API_BASE_URL: z.string(),
  STRIPE_PUBLISHABLE_KEY: z.string(),
})

const _env = envSchema.safeParse(process.env)

if (_env.success === false) {
  console.error("❌ Invalid environment variables", _env.error.format())

  throw new Error("Invalid environment variables")
}

export const env = _env.data
