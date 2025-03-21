/*
  Warnings:

  - You are about to drop the column `city` on the `sluppliers` table. All the data in the column will be lost.
  - You are about to drop the column `state` on the `sluppliers` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "sluppliers" DROP COLUMN "city",
DROP COLUMN "state";
