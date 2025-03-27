import Elysia, { t } from "elysia"
import { db } from "../../../lib/prisma"
import { auth } from "../../authentication"
import { AuthError } from "../errors/auth-error"

export const createPayment = new Elysia().post(
  `/payment/create`,
  async ({ cookie, body }) => {
    const { name, code } = body

    const user = await auth({ cookie })
    if (!user) {
      throw new AuthError("Unauthorized", "UNAUTHORIZED", 401)
    }

    const hasCompany = user.Company

    if (!hasCompany) {
      throw new AuthError("Company not found", "COMPANY_NOT_FOUND", 404)
    }

    const checkPaymentExists = await db.paymentModeCustom.findFirst({
      where: {
        name,
        code,
        company_id: hasCompany.id,
      },
    })

    if (checkPaymentExists) {
      throw new AuthError(
        "Payment já cadastrado",
        "Payment_ALREADY_EXISTS",
        400
      )
    }

    const payment = await db.paymentModeCustom.create({
      data: {
        company_id: hasCompany.id,
        name,
        code,
      },
    })

    return {
      message: "Payment cadastrado com sucesso",
      payment,
    }
  },
  {
    body: t.Object({
      name: t.String(),
      code: t.String(),
    }),
    response: {
      201: t.Object(
        {
          message: t.String(),
          payment: t.Object({
            id: t.String(),
            name: t.String(),
            code: t.String(),
          }),
        },
        {
          description: "Pagamento cadastrado com sucesso",
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
          description: "Pagamento já cadastrado",
        }
      ),
      404: t.Object(
        {
          message: t.String(),
        },
        {
          description: "Company not found",
        }
      ),
    },
    detail: {
      description: "Cadastra um novo método de pagamento",
      tags: ["Payment"],
    },
  }
)
