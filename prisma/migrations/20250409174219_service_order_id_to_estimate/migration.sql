-- DropForeignKey
ALTER TABLE "service_orders" DROP CONSTRAINT "service_orders_estimate_id_fkey";

-- AlterTable
ALTER TABLE "estimates" ADD COLUMN     "service_order_id" TEXT;
