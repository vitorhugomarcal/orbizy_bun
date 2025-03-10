import { Elysia } from "elysia"
import { createSchedule } from "./create"
import { getById } from "./getById"
import { getSchedule } from "./getSchedule"
import { removeSchedule } from "./remove"
import { updateSchedule } from "./update"

const scheduleRoutes = new Elysia()
  .use(getSchedule)
  .use(createSchedule)
  .use(updateSchedule)
  .use(removeSchedule)
  .use(getById)

export default scheduleRoutes
