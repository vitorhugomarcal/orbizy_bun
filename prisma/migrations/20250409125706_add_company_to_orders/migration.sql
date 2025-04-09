/*
  Warnings:

  - Added the required column `company_id` to the `service_orders` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "service_orders" ADD COLUMN     "company_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "service_orders" ADD CONSTRAINT "service_orders_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
