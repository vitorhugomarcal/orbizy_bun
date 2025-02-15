import { Elysia } from "elysia"

import { checkSupplier } from "./check"
import { createSupplier } from "./create"
import { createInCompany } from "./createInCompany"
import { getAllSupplier } from "./getAll"
import { getAllByCompany } from "./getAllByCompany"
import { getSupplierById } from "./getBy"
import { removeSupplier } from "./remove"
import { updateSupplier } from "./update"

const supplierRoutes = new Elysia()
  .use(createSupplier)
  .use(createInCompany)
  .use(removeSupplier)
  .use(updateSupplier)
  .use(getAllSupplier)
  .use(getAllByCompany)
  .use(getSupplierById)
  .use(checkSupplier)

export default supplierRoutes
