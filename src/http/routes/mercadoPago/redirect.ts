import Elysia, { t } from "elysia"

export const redirect = new Elysia().get(
  "/mp/redirect",
  async ({ set }) => {
    const appScheme = "vhminvoice://settings/payment"
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
      description: "Redirect to app after MercadoPago onboarding",
      tags: ["MercadoPago"],
    },
  }
)
