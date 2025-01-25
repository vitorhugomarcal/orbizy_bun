import { Elysia } from "elysia"
import { createEstimate } from "./create"
import { getEstimates } from "./getAll"
import { removeEstimate } from "./remove"

const estimateRoutes = new Elysia()
  .use(getEstimates)
  .use(removeEstimate)
  .use(createEstimate)

export default estimateRoutes
