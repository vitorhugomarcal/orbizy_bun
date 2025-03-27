import { Elysia } from "elysia"
import { createPayment } from "./create"
import { getById } from "./getById"
import { getPayments } from "./getItens"
import { removePayment } from "./remove"
import { updatePayment } from "./update"

const paymentRoutes = new Elysia()
  .use(getById)
  .use(getPayments)
  .use(createPayment)
  .use(updatePayment)
  .use(removePayment)

export default paymentRoutes
