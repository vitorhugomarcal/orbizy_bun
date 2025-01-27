/*
  Warnings:

  - Made the column `company_id` on table `clients` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "clients" ALTER COLUMN "company_id" SET NOT NULL;
