import Elysia, { t } from "elysia"
import { db } from "../../../lib/prisma"
import { auth } from "../../authentication"
import { AuthError } from "../errors/auth-error"

export const removeCategory = new Elysia().delete(
  `/category/remove/:categoryId`,
  async ({ cookie, params }) => {
    const user = await auth({ cookie })
    if (!user) {
      throw new AuthError("Unauthorized", "UNAUTHORIZED", 401)
    }

    const { categoryId } = params

    if (!categoryId) {
      throw new AuthError("Category ID is required", "MISSING_CATEGORY_ID", 400)
    }

    await db.categoryCustom.delete({
      where: {
        id: categoryId,
      },
    })
    return {
      message: "Categoria removida com sucesso",
    }
  },
  {
    params: t.Object({
      categoryId: t.String(),
    }),
    response: {
      204: t.Object(
        {
          message: t.String(),
        },
        {
          description: "Category removed successfully",
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
      description: "Remove a category",
      tags: ["Category"],
    },
  }
)
