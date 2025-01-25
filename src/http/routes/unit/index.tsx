import { Elysia } from "elysia"
import { createUnit } from "./createUnit"
import { createUnitByCompany } from "./createUnitByCompany"
import { getUnits } from "./getUnits"
import { removeUnit } from "./removeUnit"

const unitRoutes = new Elysia()
  .use(createUnit)
  .use(createUnitByCompany)
  .use(removeUnit)
  .use(getUnits)

export default unitRoutes
