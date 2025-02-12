/*
  Warnings:

  - Made the column `status` on table `estimatesSupplier` required. This step will fail if there are existing NULL values in that column.
  - Made the column `estimate_supplier_number` on table `estimatesSupplier` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "estimatesSupplier" ALTER COLUMN "status" SET NOT NULL,
ALTER COLUMN "supplier_id" DROP NOT NULL,
ALTER COLUMN "estimate_supplier_number" SET NOT NULL;
