/*
  Warnings:

  - You are about to drop the column `token` on the `auth_links` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[code]` on the table `auth_links` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `code` to the `auth_links` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "auth_links_token_key";

-- AlterTable
ALTER TABLE "auth_links" DROP COLUMN "token",
ADD COLUMN     "code" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "auth_links_code_key" ON "auth_links"("code");
