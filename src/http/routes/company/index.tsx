import { Elysia } from "elysia"
import { checkCompany } from "./check"
import { registerCompany } from "./create"
import { getCompany } from "./get"
import { getCompanyById } from "./getBy"
import { inviteToCompany } from "./invite"
import { removeCompany } from "./remove"
import { removeInviteToCompany } from "./removeInvite"
import { update } from "./update"

const companyRoutes = new Elysia()
  .use(registerCompany)
  .use(getCompany)
  .use(getCompanyById)
  .use(removeCompany)
  .use(update)
  .use(checkCompany)
  .use(inviteToCompany)
  .use(removeInviteToCompany)

export default companyRoutes
