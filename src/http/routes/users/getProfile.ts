import Elysia, { t } from "elysia"
import { auth, type CookieProps } from "../../authentication"

export const getProfile = new Elysia().get(
  "/me",
  async ({ cookie }: CookieProps) => {
    const user = await auth({ cookie })

    if (!user) {
      return { error: "Unauthorized" }
    }

    return {
      message: "Profile retrieved successfully",
      user,
    }
  },
  {
    response: {
      200: t.Object({
        message: t.String(),
        user: t.Object({
          id: t.String(),
          name: t.Nullable(t.String()),
          email: t.String(),
          company_id: t.Nullable(t.String()),
          type: t.String(),
          role: t.String(),
          Company: t.Nullable(
            t.Object({
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
              owner_id: t.String(),
              createdAt: t.Date(),
            })
          ),
        }),
      }),
      401: t.Object({
        error: t.String(),
      }),
    },
    detail: {
      description: "Get user profile",
      tags: ["User"],
    },
  }
)
