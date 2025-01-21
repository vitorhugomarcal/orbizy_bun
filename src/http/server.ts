import Elysia from "elysia"
import cors from "@elysiajs/cors"

// Importações de rotas
import { sendAuthLink } from "./routes/sendAuthLink"
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

// Configuração de CORS
app.use(
  cors({
    credentials: true,
    allowedHeaders: ["content-type"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"],
    origin: (request) => {
      const allowedOrigins = ["https://www.orbizy.app", "https://orbizy.app"]
      const origin = request.headers.get("origin")

      if (origin && allowedOrigins.includes(origin)) {
        return true
      }
      return false
    },
  })
)

// Rotas
app
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

// Proxy para /api
app.get("/api/*", async ({ params, request }) => {
  const path = params["*"]
  const targetUrl = `https://receitaws.com.br/${path}`

  try {
    const response = await fetch(targetUrl, {
      method: request.method,
      headers: {
        ...request.headers,
        host: "receitaws.com.br", // Define o host explicitamente
      },
    })

    if (!response.ok) {
      throw new Error(`Erro na API externa: ${response.statusText}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Erro no proxy /api:", error)
    return {
      error: "Erro ao acessar a API externa em /api.",
    }
  }
})

// Proxy para /cep
app.get("/cep/*", async ({ params, request }) => {
  const path = params["*"]
  const targetUrl = `https://viacep.com.br/${path}`

  try {
    const response = await fetch(targetUrl, {
      method: request.method,
      headers: {
        ...request.headers,
        host: "viacep.com.br", // Define o host explicitamente
      },
    })

    if (!response.ok) {
      throw new Error(`Erro na API externa: ${response.statusText}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Erro no proxy /cep:", error)
    return {
      error: "Erro ao acessar a API externa em /cep.",
    }
  }
})

// Inicia o servidor
app.listen(3333, () => {
  console.log("🚀 Server is running on port 3333")
})
