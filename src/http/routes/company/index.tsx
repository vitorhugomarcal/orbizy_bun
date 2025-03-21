import { Elysia } from "elysia"
import { checkCompanyCNPJ } from "./checkCNPJ"
import { checkCompanyEIN } from "./checkEIN"
import { registerCompany } from "./create"
import { getCompany } from "./get"
import { getCompanyById } from "./getBy"
import { inviteToCompany } from "./invite"
import { removeCompany } from "./remove"
import { removeInviteToCompany } from "./removeInvite"
import { update } from "./update"

const companyRoutes = new Elysia()
  .use(update)
  .use(getCompany)
  .use(removeCompany)
  .use(getCompanyById)
  .use(registerCompany)
  .use(checkCompanyEIN)
  .use(inviteToCompany)
  .use(checkCompanyCNPJ)
  .use(removeInviteToCompany)

export default companyRoutes
