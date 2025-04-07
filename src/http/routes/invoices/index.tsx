import { Elysia } from "elysia"
import { invoiceChart } from "./chart"
import { createInvoice } from "./create"
import { getAllInvoices } from "./getAll"
import { getInvoiceById } from "./getBy"
import { getInvoiceByEstimateId } from "./getByEstimate"
import { removeInvoice } from "./remove"
import { updateInvoice } from "./update"

const invoiceRoutes = new Elysia()
  .use(invoiceChart)
  .use(createInvoice)
  .use(updateInvoice)
  .use(removeInvoice)
  .use(getAllInvoices)
  .use(getInvoiceById)
  .use(getInvoiceByEstimateId)

export default invoiceRoutes
