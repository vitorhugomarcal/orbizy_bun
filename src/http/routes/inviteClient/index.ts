import { Elysia } from "elysia"
import { inviteValidate } from "../inviteClient/inviteValidate"
import { registerInvited } from "../inviteClient/registerInvited"
import { sendInviteLink } from "../inviteClient/sendInvite"

const inviteRoutes = new Elysia()
  .use(inviteValidate)
  .use(registerInvited)
  .use(sendInviteLink)

export default inviteRoutes
