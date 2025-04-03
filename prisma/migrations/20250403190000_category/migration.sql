-- DropForeignKey
ALTER TABLE "category_custom" DROP CONSTRAINT "category_custom_company_id_fkey";

-- AlterTable
ALTER TABLE "category_custom" ALTER COLUMN "company_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "category_custom" ADD CONSTRAINT "category_custom_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;
