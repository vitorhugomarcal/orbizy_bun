import { Elysia } from "elysia"
import { checkCompany } from "./check"
import { registerCompany } from "./create"
import { getCompany } from "./get"
import { inviteToCompany } from "./invite"
import { removeCompany } from "./remove"
import { update } from "./update"

const companyRoutes = new Elysia()
  .use(registerCompany)
  .use(getCompany)
  .use(removeCompany)
  .use(update)
  .use(checkCompany)
  .use(inviteToCompany)

export default companyRoutes
