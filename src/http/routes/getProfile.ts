import Elysia from "elysia"
import { auth, type CookieProps } from "../authentication"

export const getProfile = new Elysia().get(
  "/me",
  async ({ cookie }: CookieProps) => {
    // console.log("Iniciando getProfile")

    const user = await auth({ cookie })

    if (!user) {
      return { error: "Unauthorized" }
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      company: {
        id: user.company_id,
      },
    }
  }
)
