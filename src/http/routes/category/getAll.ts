import Elysia, { t } from "elysia"
import { db } from "../../../lib/prisma"
import { auth } from "../../authentication"
import { AuthError } from "../errors/auth-error"

export const getAll = new Elysia().get(
  "/categories",
  async ({ cookie }) => {
    const user = await auth({ cookie })
    if (!user) {
      throw new AuthError("Unauthorized", "UNAUTHORIZED", 401)
    }

    const hasCompany = user.company_id

    if (!hasCompany) {
      throw new AuthError("Company not found", "COMPANY_NOT_FOUND", 401)
    }

    const category = await db.categoryCustom.findMany({
      where: {
        company_id: hasCompany,
      },
    })

    if (!category) {
      throw new AuthError(
        "Categorias não encontradas",
        "CATEGORIES_NOT_FOUND",
        404
      )
    }

    return {
      message: "Categorias encontradas com sucesso",
      category,
    }
  },
  {
    response: {
      200: t.Object(
        {
          message: t.String(),
          category: t.Array(
            t.Object({
              id: t.String(),
              name: t.String(),
              company_id: t.Optional(t.String()),
            })
          ),
        },
        {
          description: "Categories retrieved successfully",
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
          description: "Not found",
        }
      ),
    },
    detail: {
      description: "Get all categories",
      tags: ["Category"],
    },
  }
)
