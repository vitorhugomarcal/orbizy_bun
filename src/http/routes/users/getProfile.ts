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
            country: t.String(),
            company_id: t.Nullable(t.String()),
            type: t.String({
              enum: ["basic", "team", "pro"],
            }),
            role: t.String({
              enum: ["MASTER", "BASIC"],
            }),
            Company: t.Nullable(
              t.Object({
                id: t.String(),
                company_name: t.String(),
                cnpj: t.Nullable(t.String()),
                ein: t.Nullable(t.String()),
                phone: t.String(),
                stripeAccountId: t.Nullable(t.String()),
                owner_id: t.String(),
                address: t.Object({
                  id: t.String(),
                  country: t.String(),
                  city: t.String(),
                  state: t.String(),
                  postal_code: t.String(),
                  cep: t.Nullable(t.String()),
                  street: t.Nullable(t.String()),
                  number: t.Nullable(t.String()),
                  neighborhood: t.Nullable(t.String()),
                  street_address: t.Nullable(t.String()),
                  unit_number: t.Nullable(t.String()),
                }),
              })
            ),
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
