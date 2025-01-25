import Elysia from "elysia"
import { db } from "../../../lib/prisma"
import { auth } from "../../authentication"
import { AuthError } from "../errors/auth-error"

export const getItens = new Elysia().get("/itens", async ({ cookie }) => {
  const user = await auth({ cookie })
  if (!user) {
    throw new AuthError("Unauthorized", "UNAUTHORIZED", 401)
  }

  const itens = await db.item.findMany({
    where: {
      company_id: user.company_id,
    },
  })
  return itens
})
