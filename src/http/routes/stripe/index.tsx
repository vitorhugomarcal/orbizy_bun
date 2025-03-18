import { Elysia } from "elysia"
import { createInvoice } from "./create"
import { registerCompany } from "./register"

const stripeRoutes = new Elysia().use(registerCompany).use(createInvoice)

export default stripeRoutes
