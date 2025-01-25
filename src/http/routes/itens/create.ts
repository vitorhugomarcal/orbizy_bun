import Elysia, { t } from "elysia"
import { db } from "../../../lib/prisma"
import { auth } from "../../authentication"
import { AuthError } from "../errors/auth-error"

export const createItem = new Elysia().post(
  `/itens/create`,
  async ({ cookie, body }) => {
    const { name, price, description, unit } = body

    const user = await auth({ cookie })
    if (!user) {
      throw new AuthError("Unauthorized", "UNAUTHORIZED", 401)
    }

    const checkItemExists = await db.item.findFirst({
      where: {
        name,
        company_id: user.company_id,
      },
    })
    if (checkItemExists) {
      throw new AuthError("Item já cadastrado", "ITEM_ALREADY_EXISTS", 400)
    }

    const item = await db.item.create({
      data: {
        company_id: user.company_id,
        name,
        price,
        description,
        unit,
      },
    })

    return {
      message: "Item cadastrado com sucesso",
      item,
    }
  },
  {
    body: t.Object({
      name: t.String(),
      price: t.Number(),
      description: t.String(),
      unit: t.String(),
    }),
  }
)
