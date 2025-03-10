/*
  Warnings:

  - You are about to drop the `Schedule` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Schedule" DROP CONSTRAINT "Schedule_client_id_fkey";

-- DropForeignKey
ALTER TABLE "Schedule" DROP CONSTRAINT "Schedule_company_id_fkey";

-- DropTable
DROP TABLE "Schedule";

-- CreateTable
CREATE TABLE "schedules" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "company_id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,

    CONSTRAINT "schedules_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
