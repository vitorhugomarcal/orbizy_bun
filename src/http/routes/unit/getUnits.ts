import Elysia from "elysia"
import { db } from "../../../lib/prisma"
import { auth } from "../../authentication"
import { AuthError } from "../errors/auth-error"

export const getUnits = new Elysia().get("/units", async ({ cookie }) => {
  const user = await auth({ cookie })
  if (!user) {
    throw new AuthError("Unauthorized", "UNAUTHORIZED", 401)
  }

  const unitCustom = await db.unitTypeCustom.findMany({
    where: {
      company_id: user.company_id,
    },
  })

  const unitDefault = await db.unitType.findMany()

  const allUnits = [...unitCustom, ...unitDefault]

  return allUnits
})
