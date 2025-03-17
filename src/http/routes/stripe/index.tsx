import { Elysia } from "elysia"
import { registerCompany } from "./register"

const stripeRoutes = new Elysia().use(registerCompany)

export default stripeRoutes
