import { Elysia } from "elysia"

import { registerClient } from "./create"
import { getAll } from "./getAll"
import { getBy } from "./getBy"
import { removeClient } from "./remove"
import { update } from "./update"

const clientsRoutes = new Elysia()
  .use(getBy)
  .use(getAll)
  .use(removeClient)
  .use(registerClient)
  .use(update)

export default clientsRoutes
