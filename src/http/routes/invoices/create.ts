import Elysia, { t } from "elysia"
import { db } from "../../../lib/prisma"
import { auth } from "../../authentication"
import { AuthError } from "../errors/auth-error"

export const createInvoice = new Elysia().post(
  `/invoice/create/:estimateId`,
  async ({ cookie, params }) => {
    const user = await auth({ cookie })
    if (!user) {
      throw new AuthError("Unauthorized", "UNAUTHORIZED", 401)
    }

    const { estimateId } = params

    if (!estimateId) {
      throw new AuthError("Client ID not provided", "MISSING_CLIENT_ID", 400)
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

    const countAllInvoices = await db.invoice.count({
      where: {
        company_id: user.company_id,
      },
    })

    const currentYear = new Date().getFullYear()

    const invoiceNumber = `#${String(countAllInvoices + 1).padStart(
      4,
      "0"
    )}-${currentYear} - ${
      checkEstimateExists.client?.type === "jurídica"
        ? checkEstimateExists.client?.company_name
        : checkEstimateExists.client?.name
    }`

    console.log(countAllInvoices)

    const invoice = await db.invoice.create({
      data: {
        company_id: user.company_id,
        estimate_id: checkEstimateExists.id,
        client_id: checkEstimateExists.client_id,
        total: checkEstimateExists.total,
        status: "DRAFT",
        invoice_number: invoiceNumber,
      },
    })

    return {
      message: "Fatura cadastrada com sucesso",
      invoice,
    }
  },
  {
    params: t.Object({
      estimateId: t.String(),
    }),
    response: {
      201: t.Object(
        {
          message: t.String(),
          invoice: t.Object({
            id: t.String(),
          }),
        },
        {
          description: "Orçamento cadastrado com sucesso",
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
      description: "Create a new invoice",
      tags: ["Invoice"],
    },
  }
)
