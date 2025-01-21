import { prisma } from "../src/lib/prisma"

async function seed() {
  await prisma.unitType.create({
    data: {
      name: "und",
    },
  }),
    await prisma.unitType.create({
      data: {
        name: "km",
      },
    }),
    await prisma.unitType.create({
      data: {
        name: "g",
      },
    }),
    await prisma.unitType.create({
      data: {
        name: "mg",
      },
    }),
    await prisma.unitType.create({
      data: {
        name: "mts",
      },
    }),
    await prisma.unitType.create({
      data: {
        name: "h",
      },
    }),
    await prisma.unitType.create({
      data: {
        name: "hrs",
      },
    }),
    await prisma.unitType.create({
      data: {
        name: "cx",
      },
    }),
    await prisma.unitType.create({
      data: {
        name: "cm",
      },
    }),
    await prisma.unitType.create({
      data: {
        name: "kg",
      },
    })
}

seed().then(() => {
  console.log("Database seeded!")
  prisma.$disconnect()
})
