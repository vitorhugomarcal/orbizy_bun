import { Elysia } from "elysia"
import authRoutes from "./auth"
import clientsRoutes from "./clients"
import companyRoutes from "./company"
import estimateRoutes from "./estimate"
import estimateItensRoutes from "./estimateItens"
import itemRoutes from "./itens"
import supplierRoutes from "./supplier"
import unitRoutes from "./unit"
import userRoutes from "./users"

const routes = new Elysia()
  .use(authRoutes)
  .use(clientsRoutes)
  .use(companyRoutes)
  .use(estimateRoutes)
  .use(estimateItensRoutes)
  .use(itemRoutes)
  .use(supplierRoutes)
  .use(unitRoutes)
  .use(userRoutes)

export default routes
