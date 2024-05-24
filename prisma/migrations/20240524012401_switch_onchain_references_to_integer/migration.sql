/*
  Warnings:

  - The `subscriptionOnchainReference` column on the `Transaction` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `onchainReference` on the `Plan` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `productOnchainReference` on the `Plan` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `onchainReference` on the `Product` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `onchainReference` on the `Subscription` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `planOnchainReference` on the `Subscription` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `productOnchainReference` on the `Subscription` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "Plan" DROP CONSTRAINT "Plan_productOnchainReference_fkey";

-- DropForeignKey
ALTER TABLE "Subscription" DROP CONSTRAINT "Subscription_planOnchainReference_fkey";

-- DropForeignKey
ALTER TABLE "Subscription" DROP CONSTRAINT "Subscription_productOnchainReference_fkey";

-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_subscriptionOnchainReference_fkey";

-- AlterTable
ALTER TABLE "Plan" DROP COLUMN "onchainReference",
ADD COLUMN     "onchainReference" INTEGER NOT NULL,
DROP COLUMN "productOnchainReference",
ADD COLUMN     "productOnchainReference" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "onchainReference",
ADD COLUMN     "onchainReference" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Subscription" DROP COLUMN "onchainReference",
ADD COLUMN     "onchainReference" INTEGER NOT NULL,
DROP COLUMN "planOnchainReference",
ADD COLUMN     "planOnchainReference" INTEGER NOT NULL,
DROP COLUMN "productOnchainReference",
ADD COLUMN     "productOnchainReference" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "subscriptionOnchainReference",
ADD COLUMN     "subscriptionOnchainReference" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Plan_onchainReference_key" ON "Plan"("onchainReference");

-- CreateIndex
CREATE UNIQUE INDEX "Product_onchainReference_key" ON "Product"("onchainReference");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_onchainReference_key" ON "Subscription"("onchainReference");

-- AddForeignKey
ALTER TABLE "Plan" ADD CONSTRAINT "Plan_productOnchainReference_fkey" FOREIGN KEY ("productOnchainReference") REFERENCES "Product"("onchainReference") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_subscriptionOnchainReference_fkey" FOREIGN KEY ("subscriptionOnchainReference") REFERENCES "Subscription"("onchainReference") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_planOnchainReference_fkey" FOREIGN KEY ("planOnchainReference") REFERENCES "Plan"("onchainReference") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_productOnchainReference_fkey" FOREIGN KEY ("productOnchainReference") REFERENCES "Product"("onchainReference") ON DELETE RESTRICT ON UPDATE CASCADE;
