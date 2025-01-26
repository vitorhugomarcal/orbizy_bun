/*
  Warnings:

  - Made the column `sub_total` on table `estimates` required. This step will fail if there are existing NULL values in that column.
  - Made the column `total` on table `estimates` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "estimates" ALTER COLUMN "sub_total" SET NOT NULL,
ALTER COLUMN "sub_total" SET DEFAULT 0,
ALTER COLUMN "total" SET NOT NULL,
ALTER COLUMN "total" SET DEFAULT 0;
