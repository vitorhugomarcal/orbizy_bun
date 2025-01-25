import cors from "@elysiajs/cors"
import Elysia from "elysia"

// Importações de rotas
import swagger from "@elysiajs/swagger"
import routes from "./routes"

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

app.use(
  swagger({
    documentation: {
      info: {
        title: "Minha API",
        description: "API para gerenciar clientes, empresas, usuários, etc.",
        version: "1.0.0",
      },
    },
  })
)

// Rotas
app.use(routes)

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
