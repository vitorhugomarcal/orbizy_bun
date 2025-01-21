import Elysia, { t } from "elysia"
import { sendAuthLink } from "./routes/sendAuthLink"
import cors from "@elysiajs/cors"
import { authFromLink } from "./routes/authLink"
import { getProfile } from "./routes/getProfile"
import { getClients } from "./routes/clients/getClients"
import { getItens } from "./routes/getItens"
import { getSuppliers } from "./routes/getSuppliers"
import { getSupplierEstimate } from "./routes/getSupplierEstimate"
import { getInvoices } from "./routes/getInvoices"
import { getCompany } from "./routes/getCompany"
import { sendInviteLink } from "./routes/sendInvite"
import { registerInvited } from "./routes/registerInvited"
import { inviteValidate } from "./routes/inviteValidate"
import { registerClient } from "./routes/clients/registerClient"
import { removeClient } from "./routes/clients/removeClient"

const app = new Elysia()
  .use(
    cors({
      credentials: true,
      allowedHeaders: ["content-type"],
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"],
      origin: "https://orbizy.app",
      // origin: (request): boolean => {
      //   const origin = request.headers.get("origin")

      //   if (!origin) {
      //     return false
      //   }

      //   return true
      // },
    })
  )
  .use(sendAuthLink)
  .use(authFromLink)
  .use(getProfile)
  .use(getClients)
  .use(getItens)
  .use(getSuppliers)
  .use(getSupplierEstimate)
  .use(getInvoices)
  .use(getCompany)
  .use(sendInviteLink)
  .use(registerInvited)
  .use(inviteValidate)
  .use(registerClient)
  .use(removeClient)

app.listen(3333, () => {
  console.log("🚀 Server is running on port 3333")
})
