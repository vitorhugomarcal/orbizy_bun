/*
  Warnings:

  - Made the column `estimate_id` on table `invoices` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "invoices" ALTER COLUMN "estimate_id" SET NOT NULL;
