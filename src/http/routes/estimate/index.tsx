import { Elysia } from "elysia"
import { createEstimate } from "./create"
import { getAllEstimates } from "./getAll"
import { getEstimateById } from "./getBy"
import { removeEstimate } from "./remove"
import { updateEstimate } from "./update"

const estimateRoutes = new Elysia()
  .use(createEstimate)
  .use(getAllEstimates)
  .use(getEstimateById)
  .use(removeEstimate)
  .use(updateEstimate)

export default estimateRoutes
