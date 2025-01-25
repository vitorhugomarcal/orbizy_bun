import { Elysia } from "elysia"

import { createSupplier } from "./createSupplier"
import { getAllSupplier } from "./getAllSupplier"
import { getSupplierById } from "./getSupplierById"
import { removeSupplier } from "./removeSupplier"
import { updateSupplier } from "./updateSupplier"

const supplierRoutes = new Elysia()
  .use(createSupplier)
  .use(removeSupplier)
  .use(updateSupplier)
  .use(getAllSupplier)
  .use(getSupplierById)

export default supplierRoutes
