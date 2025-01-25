import { Elysia } from "elysia"
import { registerCompany } from "./create"
import { getCompany } from "./get"
import { removeCompany } from "./remove"
import { update } from "./update"

const companyRoutes = new Elysia()
  .use(registerCompany)
  .use(getCompany)
  .use(removeCompany)
  .use(update)

export default companyRoutes
