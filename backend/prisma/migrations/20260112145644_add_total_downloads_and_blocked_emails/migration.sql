-- AlterTable
ALTER TABLE "users" ADD COLUMN     "total_downloads" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "blocked_emails" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "reason" VARCHAR(100) NOT NULL DEFAULT 'account_deleted',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "blocked_emails_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "blocked_emails_email_key" ON "blocked_emails"("email");
