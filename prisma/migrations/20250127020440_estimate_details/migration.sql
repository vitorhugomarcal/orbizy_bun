/*
  Warnings:

  - You are about to drop the column `estimate_number` on the `estimatesSupplier` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "estimates" ALTER COLUMN "sub_total" DROP NOT NULL,
ALTER COLUMN "sub_total" DROP DEFAULT,
ALTER COLUMN "total" DROP NOT NULL,
ALTER COLUMN "total" DROP DEFAULT;

-- AlterTable
ALTER TABLE "estimatesSupplier" DROP COLUMN "estimate_number",
ADD COLUMN     "estimate_supplier_number" TEXT;
