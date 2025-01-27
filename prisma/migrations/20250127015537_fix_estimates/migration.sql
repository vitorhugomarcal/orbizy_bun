/*
  Warnings:

  - You are about to drop the column `estimateSupplierId` on the `estimate_items` table. All the data in the column will be lost.
  - You are about to drop the column `estimate_id` on the `estimate_supplier_items` table. All the data in the column will be lost.
  - Added the required column `estimate_supplier_id` to the `estimate_supplier_items` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "estimate_items" DROP CONSTRAINT "estimate_items_estimateSupplierId_fkey";

-- DropForeignKey
ALTER TABLE "estimate_supplier_items" DROP CONSTRAINT "estimate_supplier_items_estimate_id_fkey";

-- AlterTable
ALTER TABLE "estimate_items" DROP COLUMN "estimateSupplierId";

-- AlterTable
ALTER TABLE "estimate_supplier_items" DROP COLUMN "estimate_id",
ADD COLUMN     "estimate_supplier_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "estimate_supplier_items" ADD CONSTRAINT "estimate_supplier_items_estimate_supplier_id_fkey" FOREIGN KEY ("estimate_supplier_id") REFERENCES "estimatesSupplier"("id") ON DELETE CASCADE ON UPDATE CASCADE;
