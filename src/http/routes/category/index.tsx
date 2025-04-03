import { Elysia } from "elysia"

import { createCategoryByCompany } from "./create"
import { getAll } from "./getAll"
import { removeCategory } from "./remove"

const categoryRoutes = new Elysia()
  .use(getAll)
  .use(removeCategory)
  .use(createCategoryByCompany)

export default categoryRoutes
