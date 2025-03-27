import Elysia, { t } from "elysia"
import { db } from "../../../lib/prisma"
import { auth, type CookieProps } from "../../authentication"
import { AuthError } from "../errors/auth-error"

export const getCompany = new Elysia().get(
  "/company",
  async ({ cookie }: CookieProps) => {
    const user = await auth({ cookie })
    if (!user) {
      throw new AuthError("Unauthorized", "UNAUTHORIZED", 401)
    }

    const hasCompany = user.Company

    if (!hasCompany) {
      throw new AuthError("Company not found", "COMPANY_NOT_FOUND", 400)
    }

    const company = await db.company.findUnique({
      where: {
        id: hasCompany.id,
      },
      include: {
        address: true,
        client: {
          include: {
            address: true,
          },
        },
        supplierUser: {
          include: {
            supplier: {
              include: {
                address: true,
                estimateSupplier: {
                  include: {
                    supplier: {
                      include: {
                        address: true,
                      },
                    },
                    EstimateSupplierItems: true,
                  },
                },
              },
            },
          },
        },
        paymentModeCustom: true,
        // unitTypeCustom: true,
        estimate: {
          include: {
            EstimateItems: true,
            client: {
              include: {
                address: true,
              },
            },
          },
        },
        invoice: {
          include: {
            client: { include: { address: true } },
            estimate: {
              include: {
                client: { include: { address: true } },
              },
            },
          },
        },
        item: true,
        pendingUsers: true,
        user: true,
        unitTypeCustom: true,
        schedule: {
          include: {
            client: true,
          },
        },
      },
    })

    if (!company) {
      throw new AuthError("Company not found", "COMPANY_NOT_FOUND", 400)
    }

    const formattedCompany = {
      ...company,
      supplierUser: company.supplierUser.map((supplier) => {
        return {
          ...supplier,
          supplier: {
            ...supplier.supplier,
            estimateSupplier: supplier.supplier.estimateSupplier.map(
              (estimate) => {
                return {
                  ...estimate,
                  EstimateSupplierItems: estimate.EstimateSupplierItems.map(
                    (item) => {
                      return {
                        ...item,
                        quantity: Number(item.quantity),
                      }
                    }
                  ),
                }
              }
            ),
          },
        }
      }),
      estimate: company.estimate.map((estimate) => {
        return {
          ...estimate,
          sub_total: Number(estimate.sub_total),
          total: Number(estimate.total),
        }
      }),
      invoice: company.invoice.map((invoice) => {
        return {
          ...invoice,
          total: Number(invoice.total),
          estimate: {
            ...invoice.estimate,
            sub_total: Number(invoice.estimate.sub_total),
            total: Number(invoice.estimate.total),
          },
        }
      }),
      item: company.item.map((item) => {
        return {
          ...item,
          price: Number(item.price),
        }
      }),
    }

    return {
      message: "Company found",
      company: formattedCompany,
    }
  },
  {
    response: {
      200: t.Object(
        {
          message: t.String(),
          company: t.Object({
            id: t.String(),
            company_name: t.String(),
            ein: t.Nullable(t.String()),
            cnpj: t.Nullable(t.String()),
            phone: t.String(),
            stripeAccountId: t.Nullable(t.String()),
            owner_id: t.String(),
            address: t.Object({
              id: t.String(),
              country: t.String(),
              city: t.String(),
              state: t.String(),
              postal_code: t.String(),
              street: t.Nullable(t.String()),
              number: t.Nullable(t.String()),
              neighborhood: t.Nullable(t.String()),
              street_address: t.Nullable(t.String()),
              unit_number: t.Nullable(t.String()),
            }),
            supplierUser: t.Array(
              t.Object({
                supplier: t.Object({
                  id: t.String(),
                  cnpj: t.Nullable(t.String()),
                  ein: t.Nullable(t.String()),
                  company_name: t.String(),
                  phone: t.String(),
                  email_address: t.String(),
                  address: t.Object({
                    id: t.String(),
                    country: t.String(),
                    city: t.String(),
                    state: t.String(),
                    postal_code: t.String(),
                    street: t.Nullable(t.String()),
                    number: t.Nullable(t.String()),
                    neighborhood: t.Nullable(t.String()),
                    street_address: t.Nullable(t.String()),
                    unit_number: t.Nullable(t.String()),
                  }),
                  estimateSupplier: t.Array(
                    t.Object({
                      id: t.String(),
                      estimate_supplier_number: t.Nullable(t.String()),
                      status: t.Nullable(t.String()),
                      notes: t.Nullable(t.String()),
                      createdAt: t.Date(),
                      supplier: t.Object({
                        id: t.String(),
                        company_name: t.String(),
                        cnpj: t.Nullable(t.String()),
                        ein: t.Nullable(t.String()),
                        phone: t.String(),
                        address: t.Object({
                          id: t.String(),
                          country: t.String(),
                          city: t.String(),
                          state: t.String(),
                          postal_code: t.String(),
                          street: t.Nullable(t.String()),
                          number: t.Nullable(t.String()),
                          neighborhood: t.Nullable(t.String()),
                          street_address: t.Nullable(t.String()),
                          unit_number: t.Nullable(t.String()),
                        }),
                      }),
                      EstimateSupplierItems: t.Array(
                        t.Object({
                          id: t.String(),
                          name: t.String(),
                          quantity: t.Number(),
                        })
                      ),
                    })
                  ),
                }),
              })
            ),
            client: t.Array(
              t.Object({
                id: t.String(),
                type: t.String(),
                name: t.String(),
                email_address: t.String(),
                company_name: t.Nullable(t.String()),
                cpf: t.Nullable(t.String()),
                cnpj: t.Nullable(t.String()),
                ssn: t.Nullable(t.String()),
                ein: t.Nullable(t.String()),
                phone: t.String(),
                address: t.Object({
                  id: t.String(),
                  country: t.String(),
                  city: t.String(),
                  state: t.String(),
                  postal_code: t.String(),
                  street: t.Nullable(t.String()),
                  number: t.Nullable(t.String()),
                  neighborhood: t.Nullable(t.String()),
                  street_address: t.Nullable(t.String()),
                  unit_number: t.Nullable(t.String()),
                }),
              })
            ),
            pendingUsers: t.Array(
              t.Object({
                id: t.String(),
                email: t.String(),
                company_id: t.String(),
                invited_by: t.String(),
              })
            ),
            user: t.Array(
              t.Object({
                id: t.String(),
                name: t.Nullable(t.String()),
                email: t.String(),
                country: t.String(),
                role: t.String(),
                type: t.String(),
                company_id: t.Nullable(t.String()),
              })
            ),
            estimate: t.Array(
              t.Object({
                id: t.String(),
                estimate_number: t.Nullable(t.String()),
                status: t.Nullable(t.String()),
                notes: t.Nullable(t.String()),
                sub_total: t.Nullable(t.Number()),
                total: t.Nullable(t.Number()),
                createdAt: t.Date(),
                client: t.Object({
                  id: t.String(),
                  type: t.String(),
                  name: t.String(),
                  company_name: t.Nullable(t.String()),
                  cpf: t.Nullable(t.String()),
                  cnpj: t.Nullable(t.String()),
                  ssn: t.Nullable(t.String()),
                  ein: t.Nullable(t.String()),
                  phone: t.String(),
                  address: t.Object({
                    id: t.String(),
                    country: t.String(),
                    city: t.String(),
                    state: t.String(),
                    postal_code: t.String(),
                    street: t.Nullable(t.String()),
                    number: t.Nullable(t.String()),
                    neighborhood: t.Nullable(t.String()),
                    street_address: t.Nullable(t.String()),
                    unit_number: t.Nullable(t.String()),
                  }),
                }),
              })
            ),
            invoice: t.Array(
              t.Object({
                id: t.String(),
                invoice_number: t.Nullable(t.String()),
                payment_mode: t.Nullable(t.String()),
                status: t.Nullable(t.String()),
                notes: t.Nullable(t.String()),
                stripeInvoiceId: t.Nullable(t.String()),
                paymentUrl: t.Nullable(t.String()),
                total: t.Number(),
                client: t.Object({
                  id: t.String(),
                  type: t.String(),
                  name: t.String(),
                  company_name: t.Nullable(t.String()),
                  cpf: t.Nullable(t.String()),
                  cnpj: t.Nullable(t.String()),
                  ssn: t.Nullable(t.String()),
                  ein: t.Nullable(t.String()),
                  phone: t.String(),
                  address: t.Object({
                    id: t.String(),
                    country: t.String(),
                    city: t.String(),
                    state: t.String(),
                    postal_code: t.String(),
                    street: t.Nullable(t.String()),
                    number: t.Nullable(t.String()),
                    neighborhood: t.Nullable(t.String()),
                    street_address: t.Nullable(t.String()),
                    unit_number: t.Nullable(t.String()),
                  }),
                }),
                estimate: t.Object({
                  id: t.String(),
                  estimate_number: t.String(),
                  status: t.String(),
                  notes: t.String(),
                  sub_total: t.Number(),
                  total: t.Number(),
                  client: t.Object({
                    id: t.String(),
                    type: t.String(),
                    name: t.String(),
                    company_name: t.Nullable(t.String()),
                    cpf: t.Nullable(t.String()),
                    cnpj: t.Nullable(t.String()),
                    ssn: t.Nullable(t.String()),
                    ein: t.Nullable(t.String()),
                    phone: t.String(),
                    address: t.Object({
                      id: t.String(),
                      country: t.String(),
                      city: t.String(),
                      state: t.String(),
                      postal_code: t.String(),
                      street: t.Nullable(t.String()),
                      number: t.Nullable(t.String()),
                      neighborhood: t.Nullable(t.String()),
                      street_address: t.Nullable(t.String()),
                      unit_number: t.Nullable(t.String()),
                    }),
                  }),
                }),
              })
            ),
            item: t.Array(
              t.Object({
                id: t.String(),
                name: t.String(),
                price: t.Number(),
                description: t.Nullable(t.String()),
                unit: t.String(),
              })
            ),
            unitTypeCustom: t.Array(
              t.Object({
                id: t.String(),
                name: t.String(),
                company_id: t.Nullable(t.String()),
              })
            ),
            schedule: t.Array(
              t.Object({
                id: t.String(),
                date: t.Date(),
                deviceEventId: t.Nullable(t.String()),
                client: t.Object({
                  id: t.String(),
                  name: t.String(),
                  company_name: t.Nullable(t.String()),
                  email_address: t.String(),
                  phone: t.String(),
                }),
              })
            ),
            paymentModeCustom: t.Array(
              t.Object({
                id: t.String(),
                name: t.String(),
                code: t.String(),
              })
            ),
          }),
        },
        {
          description: "Company found",
        }
      ),
      400: t.Object(
        {
          message: t.String(),
        },
        {
          description: "Company not found",
        }
      ),
      401: t.Object(
        {
          message: t.String(),
        },
        {
          description: "Unauthorized",
        }
      ),
    },
    detail: {
      description: "Get a company",
      tags: ["Company"],
    },
  }
)
