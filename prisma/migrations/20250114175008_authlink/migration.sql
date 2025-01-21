/*
  Warnings:

  - You are about to drop the column `userId` on the `auth_links` table. All the data in the column will be lost.
  - Added the required column `user_id` to the `auth_links` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "auth_links" DROP CONSTRAINT "auth_links_userId_fkey";

-- AlterTable
ALTER TABLE "auth_links" DROP COLUMN "userId",
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "auth_links" ADD CONSTRAINT "auth_links_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
