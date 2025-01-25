import { Elysia } from "elysia"
import { createItem } from "./create"
import { getById } from "./getById"
import { getItens } from "./getItens"
import { removeItem } from "./remove"
import { updateItem } from "./update"

const itemRoutes = new Elysia()
  .use(getItens)
  .use(createItem)
  .use(updateItem)
  .use(removeItem)
  .use(getById)

export default itemRoutes
