import { Elysia } from "elysia"
import { createServiceOrder } from "./create"
import { getAllServicesOrders } from "./getAll"
import { getOrderById } from "./getBy"
import { removeServiceOrder } from "./remove"
import { updateServiceOrder } from "./update"

const serviceOrderRoutes = new Elysia()
  .use(getOrderById)
  .use(createServiceOrder)
  .use(updateServiceOrder)
  .use(removeServiceOrder)
  .use(getAllServicesOrders)

export default serviceOrderRoutes
