import { Elysia } from "elysia"
import { createSupplierEstimate } from "./create"
import { getAllSupplierEstimates } from "./getAll"
import { getSupplierEstimateById } from "./getBy"
import { removeSupplierEstimate } from "./remove"
import { updateSupplierEstimate } from "./update"

const estimateSupplierRoutes = new Elysia()
  .use(createSupplierEstimate)
  .use(getAllSupplierEstimates)
  .use(getSupplierEstimateById)
  .use(removeSupplierEstimate)
  .use(updateSupplierEstimate)

export default estimateSupplierRoutes
