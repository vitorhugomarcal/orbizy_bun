import { Elysia } from "elysia"
import { authFromLink } from "./authLink"
import { inviteValidate } from "./inviteValidate"
import { logoutRoute } from "./logout"
import { registerInvited } from "./registerInvited"
import { sendAuthLink } from "./sendAuthLink"
import { sendInviteLink } from "./sendInvite"
import { sessions } from "./sessions"

const authRoutes = new Elysia()
  .use(authFromLink)
  .use(inviteValidate)
  .use(logoutRoute)
  .use(registerInvited)
  .use(sendAuthLink)
  .use(sendInviteLink)
  .use(sessions)

export default authRoutes
