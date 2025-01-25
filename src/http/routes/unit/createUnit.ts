import Elysia, { t } from "elysia"
import { db } from "../../../lib/prisma"
import { auth } from "../../authentication"
import { AuthError } from "../errors/auth-error"

export const createUnit = new Elysia().post(
  `/unit/create`,
  async ({ cookie, body }) => {
    const { name } = body

    const user = await auth({ cookie })
    if (!user) {
      throw new AuthError("Unauthorized", "UNAUTHORIZED", 401)
    }

    const checkUnitExists = await db.unitType.findFirst({
      where: {
        name,
      },
    })

    if (checkUnitExists) {
      throw new AuthError("Item já cadastrado", "ITEM_ALREADY_EXISTS", 400)
    }

    const unit = await db.unitType.create({
      data: {
        name,
      },
    })

    return {
      message: "Unidade cadastrado com sucesso",
      unit,
    }
  },
  {
    body: t.Object({
      name: t.String(),
    }),
  }
)
