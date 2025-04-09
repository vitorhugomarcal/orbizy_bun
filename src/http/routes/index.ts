import { Elysia } from "elysia"
import authRoutes from "./auth"
import categoryRoutes from "./category"
import clientsRoutes from "./clients"
import companyRoutes from "./company"
import estimateRoutes from "./estimate"
import estimateItensRoutes from "./estimateItens"
import estimateSupplierRoutes from "./estimateSupplier"
import estimateSupplierItensRoutes from "./estimateSupplierItens"
import inviteRoutes from "./inviteClient"
import invoiceRoutes from "./invoices"
import itemRoutes from "./itens"
import paymentRoutes from "./payment"
import scheduleRoutes from "./schedule"
import serviceOrderRoutes from "./serviceOrder"
import stripeRoutes from "./stripe"
import stripeUSRoutes from "./stripeUS"
import supplierRoutes from "./supplier"
import unitRoutes from "./unit"
import userRoutes from "./users"

const routes = new Elysia()
  .use(authRoutes)
  .use(itemRoutes)
  .use(unitRoutes)
  .use(userRoutes)
  .use(stripeRoutes)
  .use(inviteRoutes)
  .use(invoiceRoutes)
  .use(clientsRoutes)
  .use(companyRoutes)
  .use(paymentRoutes)
  .use(categoryRoutes)
  .use(stripeUSRoutes)
  .use(estimateRoutes)
  .use(supplierRoutes)
  .use(scheduleRoutes)
  .use(serviceOrderRoutes)
  .use(estimateItensRoutes)
  .use(estimateSupplierRoutes)
  .use(estimateSupplierItensRoutes)

export default routes
