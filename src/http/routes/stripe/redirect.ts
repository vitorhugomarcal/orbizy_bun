import Elysia, { t } from "elysia"

export const redirect = new Elysia().get(
  "/redirect-to-app",
  async ({ set }) => {
    const appScheme = "vhminvoice://(tabs)"
    set.headers["Location"] = appScheme
    set.status = 302

    return { message: "Redirecting to app" }
  },
  {
    response: {
      302: t.Object(
        {
          message: t.String(),
        },
        {
          description: "Redirect to app",
        }
      ),
    },
    detail: {
      description: "Redirect to app after Stripe onboarding",
      tags: ["Stripe"],
    },
  }
)
