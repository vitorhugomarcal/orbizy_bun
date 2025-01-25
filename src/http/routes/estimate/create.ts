import Elysia, { t } from "elysia"
import { db } from "../../../lib/prisma"
import { auth } from "../../authentication"
import { AuthError } from "../errors/auth-error"

export const createEstimate = new Elysia().post(
  `/estimate/create`,
  async ({ cookie, body, params }) => {
    const { estimate_number, status, notes, sub_total, total } = body

    const { clientId } = params

    const user = await auth({ cookie })
    if (!user) {
      throw new AuthError("Unauthorized", "UNAUTHORIZED", 401)
    }

    const checkClientExists = await db.client.findUnique({
      where: {
        id: clientId,
      },
    })
    if (!checkClientExists) {
      throw new AuthError("Client not found", "CLIENT_NOT_FOUND", 404)
    }

    const estimate = await db.estimate.create({
      data: {
        company_id: user.Company?.id,
        client_id: clientId,
        estimate_number,
        status,
        notes,
        sub_total,
        total,
      },
    })

    return {
      message: "Orçamento cadastrado com sucesso",
      estimate,
    }
  },
  {
    body: t.Object({
      estimate_number: t.String(),
      status: t.String(),
      notes: t.String(),
      sub_total: t.Number(),
      total: t.Number(),
    }),
    params: t.Object({
      clientId: t.String(),
    }),
  }
)
