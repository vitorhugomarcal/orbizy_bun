import Elysia, { t } from "elysia"
import { db } from "../../../lib/prisma"
import { auth } from "../../authentication"
import { AuthError } from "../errors/auth-error"

export const removeCompany = new Elysia().delete(
  `/company/remove/:companyId`,
  async ({ cookie, params }) => {
    const user = await auth({ cookie })
    if (!user) {
      throw new AuthError("Unauthorized", "UNAUTHORIZED", 401)
    }

    const { companyId } = params

    await db.company.delete({
      where: {
        id: companyId,
      },
    })
  },
  {
    params: t.Object({
      companyId: t.String(),
    }),
  }
)
