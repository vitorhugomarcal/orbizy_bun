import { Elysia } from "elysia"
import { createPreferences } from "./createPreferences"
import { exchangeToken } from "./exchange"
import { refreshToken } from "./refreshToken"

const mercadoPagoRoutes = new Elysia()
  .use(refreshToken)
  .use(exchangeToken)
  .use(createPreferences)

export default mercadoPagoRoutes
