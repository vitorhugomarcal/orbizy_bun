import Elysia from "elysia"
import { removeCookie } from "../../utils/cookie"

export const logoutRoute = new Elysia().get("/signout", async ({ cookie }) => {
  removeCookie(cookie.auth)

  return new Response(null, {
    status: 302,
    headers: {
      Location: "/",
    },
  })
})
