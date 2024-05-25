/*
  Warnings:

  - A unique constraint covering the columns `[accountAddress]` on the table `ApiKey` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `status` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('SUCCESS', 'FAILED', 'PENDING');

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "status" "TransactionStatus" NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "ApiKey_accountAddress_key" ON "ApiKey"("accountAddress");
