import Elysia, { t } from "elysia"
import { db } from "../../../lib/prisma"
import { auth } from "../../authentication"
import { AuthError } from "../errors/auth-error"

export const getItens = new Elysia().get(
  "/itens",
  async ({ cookie }) => {
    const user = await auth({ cookie })
    if (!user) {
      throw new AuthError("Unauthorized", "UNAUTHORIZED", 401)
    }

    const hasCompany = user.Company

    if (!hasCompany) {
      throw new AuthError("Company not found", "COMPANY_NOT_FOUND", 404)
    }

    const itens = await db.item.findMany({
      where: {
        company_id: hasCompany.id,
      },
    })
    if (!itens) {
      throw new AuthError("Itens not found", "ITENS_NOT_FOUND", 404)
    }

    const formattedItens = itens.map((item) => ({
      ...item,
      price: Number(item.price),
    }))
    return {
      message: "Itens found successfully",
      formattedItens,
    }
  },
  {
    response: {
      200: t.Object(
        {
          message: t.String(),
          formattedItens: t.Array(
            t.Object({
              id: t.String(),
              name: t.String(),
              price: t.Number(),
              description: t.String(),
              unit: t.String(),
            })
          ),
        },
        {
          description: "Itens found successfully",
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
      404: t.Object(
        {
          message: t.String(),
        },
        {
          description: "Itens not found",
        }
      ),
    },
    detail: {
      description: "Get all itens",
      tags: ["Itens"],
    },
  }
)
