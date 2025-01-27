import { Elysia } from "elysia"

import { createClient } from "./create"
import { getAll } from "./getAll"
import { getBy } from "./getBy"
import { getByMonth } from "./getByMonth"
import { removeClient } from "./remove"
import { update } from "./update"

const clientsRoutes = new Elysia()
  .use(getBy)
  .use(getAll)
  .use(removeClient)
  .use(createClient)
  .use(update)
  .use(getByMonth)

export default clientsRoutes
