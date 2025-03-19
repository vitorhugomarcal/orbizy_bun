import { Elysia } from "elysia"
import { createInvoice } from "./create"
import { redirect } from "./redirect"
import { registerCompany } from "./register"
import { removeStripe } from "./remove"

const stripeRoutes = new Elysia()
  .use(redirect)
  .use(removeStripe)
  .use(createInvoice)
  .use(registerCompany)

export default stripeRoutes
