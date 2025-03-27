/*
  Warnings:

  - You are about to drop the column `mp_at` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `mp_id` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `mp_rt` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "payments_mode_custom" ADD COLUMN     "code" TEXT;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "mp_at",
DROP COLUMN "mp_id",
DROP COLUMN "mp_rt";
