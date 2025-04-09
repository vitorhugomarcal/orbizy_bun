import Elysia, { t } from "elysia"
import { db } from "../../../lib/prisma"
import { auth } from "../../authentication"
import { AuthError } from "../errors/auth-error"

export const createServiceOrder = new Elysia().post(
  `/order/create/:estimateId/:userId`,
  async ({ cookie, params }) => {
    const user = await auth({ cookie })
    if (!user) {
      throw new AuthError("Unauthorized", "UNAUTHORIZED", 401)
    }

    const { estimateId, userId } = params

    if (!estimateId && !userId) {
      throw new AuthError(
        "Estimate ID or User ID not provided",
        "MISSING_ESTIMATE_USER_ID",
        400
      )
    }

    const hasCompany = user.company_id

    if (!hasCompany) {
      throw new AuthError("Company not found", "COMPANY_NOT_FOUND", 404)
    }

    const checkEstimateExists = await db.estimate.findUnique({
      where: {
        id: estimateId,
      },
      include: {
        client: true,
      },
    })

    if (!checkEstimateExists) {
      throw new AuthError("Estimate not found", "ESTIMATE_NOT_FOUND", 404)
    }

    const order = await db.serviceOrder.create({
      data: {
        estimate_id: checkEstimateExists.id,
        user_id: userId,
        status: "PENDING",
        company_id: hasCompany,
      },
    })

    return {
      message: "Ordem de serviço cadastrada com sucesso",
      order,
    }
  },
  {
    params: t.Object({
      estimateId: t.String(),
      userId: t.String(),
    }),
    response: {
      201: t.Object(
        {
          message: t.String(),
          order: t.Object({
            id: t.String(),
          }),
        },
        {
          description: "Ordem de serviço cadastrada com sucesso",
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
          description: "Client not found",
        }
      ),
    },
    detail: {
      description: "Create a new service order",
      tags: ["ServiceOrder"],
    },
  }
)
