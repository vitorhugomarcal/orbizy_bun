import Elysia, { t } from "elysia"
import { db } from "../../../lib/prisma"
import { formatCNPJ } from "../../../utils/formatCNPJ"
import { formatCPF } from "../../../utils/formatCPF"
import { auth } from "../../authentication"
import { AuthError } from "../errors/auth-error"

export const checkSupplierCNPJ = new Elysia().get(
  "/supplier/check/cnpj/:cnpj",
  async ({ cookie, params }) => {
    try {
      // Verificar se params e cnpj existem
      if (!params || !params.cnpj) {
        throw new Error("CNPJ não fornecido")
      }

      const { cnpj } = params

      // Verificar autenticação
      const user = await auth({ cookie })
      if (!user) {
        throw new AuthError("Não autorizado", "UNAUTHORIZED", 401)
      }

      // Formatar CNPJ/CPF
      const formattedId = formatCNPJ(cnpj) || formatCPF(cnpj)

      if (!formattedId) {
        throw new Error("CNPJ/CPF inválido")
      }

      // Buscar fornecedor
      const checkSupplierExists = await db.supplier.findUnique({
        where: { cnpj: formattedId },
        select: { id: true }, // Seleciona apenas o campo id
      })

      if (checkSupplierExists && checkSupplierExists.id) {
        return {
          message: "Supplier already exists",
          supplier: {
            id: checkSupplierExists.id,
          },
        }
      } else {
        return {
          message: "Supplier not found",
        }
      }
    } catch (error) {
      console.error("Erro ao verificar fornecedor:", error)

      if (error instanceof AuthError) {
        return {
          status: error.statusCode,
          message: error.message,
        }
      }

      return {
        status: 500,
        message: "Erro interno ao verificar fornecedor",
      }
    }
  },
  {
    params: t.Object({
      cnpj: t.String(),
    }),
    response: {
      200: t.Object({
        message: t.String(),
        supplier: t.Optional(
          t.Object({
            id: t.String(),
          })
        ),
      }),
      400: t.Object({
        message: t.String(),
      }),
      401: t.Object({
        message: t.String(),
      }),
      500: t.Object({
        message: t.String(),
      }),
    },
    detail: {
      description:
        "Verifica se o Fornecedor existe (pessoa física ou jurídica)",
      tags: ["Supplier"],
    },
  }
)
