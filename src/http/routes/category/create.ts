import Elysia, { t } from "elysia"
import { db } from "../../../lib/prisma"
import { auth } from "../../authentication"
import { AuthError } from "../errors/auth-error"

export const createCategoryByCompany = new Elysia().post(
  `/category/create`,
  async ({ cookie, body }) => {
    const { name } = body

    const user = await auth({ cookie })
    if (!user) {
      throw new AuthError("Unauthorized", "UNAUTHORIZED", 401)
    }

    const company = user.Company
    if (!company) {
      throw new AuthError("Company not found", "COMPANY_NOT_FOUND", 401)
    }

    const checkCategoryExists = await db.categoryCustom.findFirst({
      where: {
        name,
      },
    })

    if (checkCategoryExists) {
      throw new AuthError(
        "Categoria já cadastrada",
        "CATEGORY_ALREADY_EXISTS",
        400
      )
    }

    const category = await db.categoryCustom.create({
      data: {
        company_id: company.id,
        name,
      },
    })

    return {
      message: "Categoria cadastrada com sucesso",
      category,
    }
  },
  {
    body: t.Object({
      name: t.String(),
    }),
    response: {
      201: t.Object(
        {
          message: t.String(),
          category: t.Object({
            name: t.String(),
          }),
        },
        {
          description: "Category created successfully",
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
      400: t.Object(
        {
          message: t.String(),
        },
        {
          description: "Categoria já cadastrada",
        }
      ),
    },
    detail: {
      description: "Create a new category for a company",
      tags: ["Category"],
    },
  }
)
