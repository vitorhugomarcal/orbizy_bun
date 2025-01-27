/*
  Warnings:

  - Made the column `estimate_number` on table `estimates` required. This step will fail if there are existing NULL values in that column.
  - Made the column `status` on table `estimates` required. This step will fail if there are existing NULL values in that column.
  - Made the column `sub_total` on table `estimates` required. This step will fail if there are existing NULL values in that column.
  - Made the column `total` on table `estimates` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "estimates" ALTER COLUMN "estimate_number" SET NOT NULL,
ALTER COLUMN "status" SET NOT NULL,
ALTER COLUMN "sub_total" SET NOT NULL,
ALTER COLUMN "total" SET NOT NULL;
