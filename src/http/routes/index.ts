import { Elysia } from "elysia"
import authRoutes from "./auth"
import clientsRoutes from "./clients"
import companyRoutes from "./company"
import estimateRoutes from "./estimate"
import itemRoutes from "./itens"
import supplierRoutes from "./supplier"
import unitRoutes from "./unit"

const routes = new Elysia()
  .use(authRoutes)
  .use(clientsRoutes)
  .use(companyRoutes)
  .use(estimateRoutes)
  .use(itemRoutes)
  .use(supplierRoutes)
  .use(unitRoutes)

export default routes
