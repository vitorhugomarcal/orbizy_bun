import { Elysia } from "elysia"
import { authFromLink } from "./authLink"
import { logoutRoute } from "./logout"
import { sendAuthLink } from "./sendAuthLink"
import { sessions } from "./sessions"

const authRoutes = new Elysia()
  .use(authFromLink)
  .use(logoutRoute)
  .use(sendAuthLink)
  .use(sessions)

export default authRoutes
