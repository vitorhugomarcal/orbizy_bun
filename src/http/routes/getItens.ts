import Elysia from "elysia"
import { auth, type CookieProps } from "../authentication"
import { db } from "../../lib/prisma"

export const getItens = new Elysia().get(
  "/company/itens",
  async ({ cookie }: CookieProps) => {
    // console.log("Iniciando getItens")

    const user = await auth({ cookie })

    if (!user) {
      return { error: "Unauthorized" }
    }

    const itens = await db.item.findMany({
      where: {
        company_id: user.company_id,
      },
    })
    // console.log("Itens encontrados:", itens)
    return itens
  }
)
