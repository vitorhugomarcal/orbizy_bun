import { Elysia } from "elysia"
import { createInvoice } from "./create"
import { getAccount } from "./getAccount"
import { redirect } from "./redirect"
import { registerCompany } from "./register"
import { registerUSCompany } from "./registerUS"
import { removeStripe } from "./remove"

const stripeRoutes = new Elysia()
  .use(redirect)
  .use(getAccount)
  .use(removeStripe)
  .use(createInvoice)
  .use(registerCompany)
  .use(registerUSCompany)

export default stripeRoutes
