/*
  Warnings:

  - You are about to drop the column `service_order_id` on the `estimates` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "estimates" DROP COLUMN "service_order_id";

-- AddForeignKey
ALTER TABLE "service_orders" ADD CONSTRAINT "service_orders_estimate_id_fkey" FOREIGN KEY ("estimate_id") REFERENCES "estimates"("id") ON DELETE CASCADE ON UPDATE CASCADE;
