/*
  Warnings:

  - You are about to drop the column `city` on the `companies` table. All the data in the column will be lost.
  - You are about to drop the column `state` on the `companies` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "companies" DROP COLUMN "city",
DROP COLUMN "state";
