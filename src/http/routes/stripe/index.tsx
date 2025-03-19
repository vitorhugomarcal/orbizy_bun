import { Elysia } from "elysia"
import { createInvoice } from "./create"
import { registerCompany } from "./register"
import { removeStripe } from "./remove"

const stripeRoutes = new Elysia()
  .use(registerCompany)
  .use(createInvoice)
  .use(removeStripe)

export default stripeRoutes
