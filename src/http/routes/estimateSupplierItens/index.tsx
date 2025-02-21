import { Elysia } from "elysia"
import { createEstimateSupplierItem } from "./createEstimateSupplierItem"
import { getByEstimateSupplier } from "./getByEstimateSupplier"
import { removeEstimateSupplierItem } from "./removeEstimateSupplierItem"
import { updateEstimateSupplierItem } from "./updateEstimateSupplierItem"

const estimateSupplierItensRoutes = new Elysia()
  .use(createEstimateSupplierItem)
  .use(updateEstimateSupplierItem)
  .use(removeEstimateSupplierItem)
  .use(getByEstimateSupplier)

export default estimateSupplierItensRoutes
