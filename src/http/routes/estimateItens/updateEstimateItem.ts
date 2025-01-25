import Elysia, { t } from "elysia"
import { db } from "../../../lib/prisma"
import { auth } from "../../authentication"
import { AuthError } from "../errors/auth-error"

export const updateEstimateItem = new Elysia().patch(
  `/itens/estimate/update/:itemInvoiceId`,
  async ({ cookie, body, params }) => {
    const { name, quantity, price, unit, total } = body

    const user = await auth({ cookie })
    if (!user) {
      throw new AuthError("Unauthorized", "UNAUTHORIZED", 401)
    }

    const { itemInvoiceId } = params

    const checkItemExists = await db.estimateItems.findUnique({
      where: {
        id: itemInvoiceId,
      },
    })
    if (!checkItemExists) {
      throw new AuthError(
        "Item não encontrado no orçamento",
        "ESTIMATE_ITEM_NOT_FOUND",
        404
      )
    }

    const item = await db.estimateItems.update({
      where: {
        id: itemInvoiceId,
      },
      data: {
        estimate_id: itemInvoiceId,
        name,
        quantity,
        price,
        unit,
        total,
      },
    })

    return {
      message: "Item cadastrado com sucesso",
      item,
    }
  },
  {
    body: t.Object({
      name: t.Optional(t.String()),
      quantity: t.Optional(t.Number()),
      price: t.Optional(t.Number()),
      unit: t.Optional(t.String()),
      total: t.Optional(t.Number()),
    }),
    params: t.Object({
      itemInvoiceId: t.String(),
    }),
  }
)
