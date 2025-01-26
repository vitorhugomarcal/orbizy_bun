import { Elysia } from "elysia"
import { estimateChart } from "./chart"
import { createEstimate } from "./create"
import { getAllEstimates } from "./getAll"
import { getEstimateById } from "./getBy"
import { monthEstimates } from "./monthEstimates"
import { monthTotal } from "./monthTotal"
import { removeEstimate } from "./remove"
import { updateEstimate } from "./update"

const estimateRoutes = new Elysia()
  .use(createEstimate)
  .use(getAllEstimates)
  .use(getEstimateById)
  .use(removeEstimate)
  .use(updateEstimate)
  .use(monthEstimates)
  .use(monthTotal)
  .use(estimateChart)

export default estimateRoutes
