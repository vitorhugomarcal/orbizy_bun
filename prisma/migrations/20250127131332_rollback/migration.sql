/*
  Warnings:

  - You are about to drop the column `estimate_client_id` on the `estimate_items` table. All the data in the column will be lost.
  - You are about to drop the `estimates_clients` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `estimate_id` to the `estimate_items` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "estimate_items" DROP CONSTRAINT "estimate_items_estimate_client_id_fkey";

-- DropForeignKey
ALTER TABLE "estimates_clients" DROP CONSTRAINT "estimates_clients_client_id_fkey";

-- DropForeignKey
ALTER TABLE "estimates_clients" DROP CONSTRAINT "estimates_clients_company_id_fkey";

-- AlterTable
ALTER TABLE "estimate_items" DROP COLUMN "estimate_client_id",
ADD COLUMN     "estimate_id" TEXT NOT NULL;

-- DropTable
DROP TABLE "estimates_clients";

-- CreateTable
CREATE TABLE "estimates" (
    "id" TEXT NOT NULL,
    "estimate_number" TEXT,
    "status" TEXT,
    "notes" TEXT,
    "sub_total" DECIMAL(65,30),
    "total" DECIMAL(65,30),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "company_id" TEXT,
    "client_id" TEXT,

    CONSTRAINT "estimates_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "estimates" ADD CONSTRAINT "estimates_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "estimates" ADD CONSTRAINT "estimates_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "estimate_items" ADD CONSTRAINT "estimate_items_estimate_id_fkey" FOREIGN KEY ("estimate_id") REFERENCES "estimates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
