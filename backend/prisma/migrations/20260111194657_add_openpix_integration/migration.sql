/*
  Warnings:

  - A unique constraint covering the columns `[openpix_charge_id]` on the table `payments` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[openpix_global_id]` on the table `payments` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[correlation_id]` on the table `payments` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[openpix_subscription_id]` on the table `subscriptions` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[openpix_global_id]` on the table `subscriptions` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('CHARGE', 'SUBSCRIPTION');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "PaymentStatus" ADD VALUE 'ACTIVE';
ALTER TYPE "PaymentStatus" ADD VALUE 'EXPIRED';

-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "br_code" TEXT,
ADD COLUMN     "correlation_id" VARCHAR(255),
ADD COLUMN     "expires_at" TIMESTAMP(3),
ADD COLUMN     "openpix_charge_id" VARCHAR(255),
ADD COLUMN     "openpix_global_id" VARCHAR(255),
ADD COLUMN     "payment_link_url" TEXT,
ADD COLUMN     "payment_type" "PaymentType" NOT NULL DEFAULT 'CHARGE',
ADD COLUMN     "qr_code_image" TEXT;

-- AlterTable
ALTER TABLE "subscriptions" ADD COLUMN     "day_generate_charge" INTEGER,
ADD COLUMN     "openpix_global_id" VARCHAR(255),
ADD COLUMN     "openpix_subscription_id" VARCHAR(255);

-- CreateIndex
CREATE UNIQUE INDEX "payments_openpix_charge_id_key" ON "payments"("openpix_charge_id");

-- CreateIndex
CREATE UNIQUE INDEX "payments_openpix_global_id_key" ON "payments"("openpix_global_id");

-- CreateIndex
CREATE UNIQUE INDEX "payments_correlation_id_key" ON "payments"("correlation_id");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_openpix_subscription_id_key" ON "subscriptions"("openpix_subscription_id");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_openpix_global_id_key" ON "subscriptions"("openpix_global_id");
