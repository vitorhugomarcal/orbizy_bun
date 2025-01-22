import { type Cookie } from "elysia"

export const setCookie = (cookie: Cookie<any>, token: string) => {
  cookie.set({
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: "/",
  })
}
export const removeCookie = (cookie: Cookie<any>) => {
  cookie.remove()
}
