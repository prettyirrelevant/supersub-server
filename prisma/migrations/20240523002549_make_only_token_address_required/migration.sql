/*
  Warnings:

  - Added the required column `tokenAddress` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Token" ADD COLUMN     "symbol" TEXT,
ALTER COLUMN "decimals" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "tokenAddress" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_tokenAddress_fkey" FOREIGN KEY ("tokenAddress") REFERENCES "Token"("address") ON DELETE RESTRICT ON UPDATE CASCADE;
