/*
  Warnings:

  - Added the required column `type` to the `payments_mode_custom` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "payments_mode_custom" ADD COLUMN     "type" TEXT NOT NULL;
