import { Elysia } from "elysia"
import { createInvoice } from "./create"
import { getAccount } from "./getAccount"
import { redirect } from "./redirect"
import { registerUSCompany } from "./register"
import { removeStripe } from "./remove"

const stripeUSRoutes = new Elysia()
  .use(redirect)
  .use(getAccount)
  .use(removeStripe)
  .use(createInvoice)
  .use(registerUSCompany)

export default stripeUSRoutes
