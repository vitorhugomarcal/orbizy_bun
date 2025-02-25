-- DropForeignKey
ALTER TABLE "auth_links" DROP CONSTRAINT "auth_links_user_id_fkey";

-- DropForeignKey
ALTER TABLE "invite_links" DROP CONSTRAINT "invite_links_company_id_fkey";

-- AddForeignKey
ALTER TABLE "auth_links" ADD CONSTRAINT "auth_links_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invite_links" ADD CONSTRAINT "invite_links_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
