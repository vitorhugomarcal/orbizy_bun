import { Elysia } from "elysia"
import { createEstimateItem } from "./createEstimateItem"
import { getByEstimate } from "./getByEstimate"
import { removeEstimateItem } from "./removeEstimateItem"
import { updateEstimateItem } from "./updateEstimateItem"

const estimateItensRoutes = new Elysia()
  .use(createEstimateItem)
  .use(updateEstimateItem)
  .use(removeEstimateItem)
  .use(getByEstimate)

export default estimateItensRoutes
