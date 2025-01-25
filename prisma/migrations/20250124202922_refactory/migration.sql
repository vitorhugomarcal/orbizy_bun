/*
  Warnings:

  - You are about to drop the column `supplier_id` on the `estimates` table. All the data in the column will be lost.
  - Added the required column `price` to the `estimate_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total` to the `estimate_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unit` to the `estimate_items` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "estimates" DROP CONSTRAINT "estimates_supplier_id_fkey";

-- AlterTable
ALTER TABLE "estimate_items" ADD COLUMN     "estimateSupplierId" TEXT,
ADD COLUMN     "price" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "total" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "unit" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "estimates" DROP COLUMN "supplier_id",
ADD COLUMN     "client_id" TEXT,
ADD COLUMN     "sub_total" DECIMAL(65,30),
ADD COLUMN     "total" DECIMAL(65,30);

-- CreateTable
CREATE TABLE "estimatesSupplier" (
    "id" TEXT NOT NULL,
    "estimate_number" TEXT,
    "status" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "supplier_id" TEXT NOT NULL,
    "company_id" TEXT,

    CONSTRAINT "estimatesSupplier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "estimate_supplier_items" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "quantity" DECIMAL(65,30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estimate_id" TEXT NOT NULL,

    CONSTRAINT "estimate_supplier_items_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "estimates" ADD CONSTRAINT "estimates_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "estimate_items" ADD CONSTRAINT "estimate_items_estimateSupplierId_fkey" FOREIGN KEY ("estimateSupplierId") REFERENCES "estimatesSupplier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "estimatesSupplier" ADD CONSTRAINT "estimatesSupplier_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "sluppliers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "estimatesSupplier" ADD CONSTRAINT "estimatesSupplier_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "estimate_supplier_items" ADD CONSTRAINT "estimate_supplier_items_estimate_id_fkey" FOREIGN KEY ("estimate_id") REFERENCES "estimatesSupplier"("id") ON DELETE CASCADE ON UPDATE CASCADE;
