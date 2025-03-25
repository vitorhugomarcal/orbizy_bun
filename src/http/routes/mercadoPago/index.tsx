import { Elysia } from "elysia"
import { createPreferences } from "./createPreferences"
import { exchangeToken } from "./exchange"
import { redirect } from "./redirect"
import { refreshToken } from "./refreshToken"

const mercadoPagoRoutes = new Elysia()
  .use(redirect)
  .use(refreshToken)
  .use(exchangeToken)
  .use(createPreferences)

export default mercadoPagoRoutes
