import Elysia, { t } from "elysia"
import { auth, type CookieProps } from "../../authentication"
import { AuthError } from "../errors/auth-error"

export const getProfile = new Elysia().get(
  "/me",
  async ({ cookie }: CookieProps) => {
    const user = await auth({ cookie })
    if (!user) {
      throw new AuthError("Unauthorized", "UNAUTHORIZED", 401)
    }

    return {
      message: "Profile retrieved successfully",
      user,
    }
  },
  {
    response: {
      200: t.Object(
        {
          message: t.String(),
          user: t.Object({
            id: t.String(),
            name: t.String(),
            email: t.String(),
            company_id: t.String(),
            type: t.String({
              enum: ["basic", "team", "pro"],
            }),
            role: t.String({
              enum: ["MASTER", "BASIC"],
            }),
            Company: t.Object({
              id: t.String(),
              cnpj: t.String(),
              phone: t.String(),
              state: t.String(),
              city: t.String(),
              cep: t.String(),
              address: t.String(),
              neighborhood: t.String(),
              address_number: t.String(),
              company_name: t.String(),
              stripeAccountId: t.String(),
              owner_id: t.String(),
            }),
          }),
        },
        {
          description: "Profile retrieved successfully",
        }
      ),
      401: t.Object(
        {
          message: t.String(),
        },
        {
          description: "Unauthorized",
        }
      ),
    },
    detail: {
      description: "Get user profile",
      tags: ["User"],
    },
  }
)
