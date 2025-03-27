/*
  Warnings:

  - Made the column `code` on table `payments_mode_custom` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "payments_mode_custom" ALTER COLUMN "code" SET NOT NULL;
