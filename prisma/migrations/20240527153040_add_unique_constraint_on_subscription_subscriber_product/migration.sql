/*
  Warnings:

  - A unique constraint covering the columns `[subscriberAddress,productOnchainReference]` on the table `Subscription` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Subscription_subscriberAddress_productOnchainReference_key" ON "Subscription"("subscriberAddress", "productOnchainReference");
