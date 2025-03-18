-- AlterTable
ALTER TABLE "invoices" ADD COLUMN     "paymentUrl" TEXT,
ADD COLUMN     "stripeInvoiceId" TEXT;
