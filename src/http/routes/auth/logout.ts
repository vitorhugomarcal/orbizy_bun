import Elysia, { t } from "elysia"
import { removeCookie } from "../../../utils/cookie"

export const logoutRoute = new Elysia().get(
  "/signout",
  async ({ cookie }) => {
    removeCookie(cookie.auth)
  },
  {
    response: {
      302: t.Object(
        {
          message: t.String(),
        },
        {
          description: "Logout realizado com sucesso",
        }
      ),
    },
    detail: {
      description: "Desconecta o usuário",
      tags: ["Auth"],
    },
  }
)
