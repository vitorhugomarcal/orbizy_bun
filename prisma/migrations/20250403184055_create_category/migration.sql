-- AlterTable
ALTER TABLE "items" ADD COLUMN     "category_custom_id" TEXT;

-- CreateTable
CREATE TABLE "category_custom" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,

    CONSTRAINT "category_custom_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "category_custom" ADD CONSTRAINT "category_custom_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "items" ADD CONSTRAINT "items_category_custom_id_fkey" FOREIGN KEY ("category_custom_id") REFERENCES "category_custom"("id") ON DELETE CASCADE ON UPDATE CASCADE;
