/*
  Warnings:

  - You are about to drop the column `accountAddress` on the `Transaction` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_accountAddress_fkey";

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "accountAddress",
ADD COLUMN     "sender" TEXT;
