import Elysia, { t } from "elysia"
import { db } from "../../../lib/prisma"
import { auth } from "../../authentication"
import { AuthError } from "../errors/auth-error"

export const removeSupplierEstimate = new Elysia().delete(
  `/supplier/estimate/remove/:estimateId`,
  async ({ cookie, params }) => {
    const user = await auth({ cookie })
    if (!user) {
      throw new AuthError("Unauthorized", "UNAUTHORIZED", 401)
    }

    const { estimateId } = params

    if (!estimateId) {
      throw new AuthError("Orçamento não encontrado", "ESTIMATE_NOT_FOUND", 404)
    }

    await db.estimateSupplier.delete({
      where: {
        id: estimateId,
      },
    })

    return {
      message: "Estimate removed successfully",
    }
  },
  {
    params: t.Object({
      estimateId: t.String(),
    }),
    response: {
      204: t.Object(
        {
          message: t.String(),
        },
        {
          description: "Estimate removed successfully",
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
          description: "Estimate not found",
        }
      ),
    },
    detail: {
      description: "Remove a estimate",
      tags: ["SupplierEstimate"],
    },
  }
)
