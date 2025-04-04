import { Elysia } from "elysia"
import { createInvoice } from "./create"
import { getAccount } from "./getAccount"
import { redirect } from "./redirect"
import { registerCompany } from "./register"
import { registerUSCompany } from "./registerUS"
import { removeStripe } from "./remove"
import { removeCustomers } from "./removeCustomers"
import { removeInvoice } from "./removeInvoice"

const stripeRoutes = new Elysia()
  .use(redirect)
  .use(getAccount)
  .use(removeStripe)
  .use(removeInvoice)
  .use(createInvoice)
  .use(registerCompany)
  .use(removeCustomers)
  .use(registerUSCompany)

export default stripeRoutes
