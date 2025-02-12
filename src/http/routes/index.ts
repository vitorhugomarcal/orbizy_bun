import { Elysia } from "elysia"
import authRoutes from "./auth"
import clientsRoutes from "./clients"
import companyRoutes from "./company"
import estimateRoutes from "./estimate"
import estimateItensRoutes from "./estimateItens"
import estimateSupplierRoutes from "./estimateSupplier"
import inviteRoutes from "./inviteClient"
import itemRoutes from "./itens"
import supplierRoutes from "./supplier"
import unitRoutes from "./unit"
import userRoutes from "./users"

const routes = new Elysia()
  .use(authRoutes)
  .use(itemRoutes)
  .use(unitRoutes)
  .use(userRoutes)
  .use(inviteRoutes)
  .use(clientsRoutes)
  .use(companyRoutes)
  .use(estimateRoutes)
  .use(supplierRoutes)
  .use(estimateItensRoutes)
  .use(estimateSupplierRoutes)

export default routes
