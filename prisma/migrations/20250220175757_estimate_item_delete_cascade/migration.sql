-- DropForeignKey
ALTER TABLE "estimate_items" DROP CONSTRAINT "estimate_items_estimate_id_fkey";

-- AddForeignKey
ALTER TABLE "estimate_items" ADD CONSTRAINT "estimate_items_estimate_id_fkey" FOREIGN KEY ("estimate_id") REFERENCES "estimates"("id") ON DELETE CASCADE ON UPDATE CASCADE;
