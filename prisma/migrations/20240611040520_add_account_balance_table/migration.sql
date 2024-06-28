-- CreateTable
CREATE TABLE "AccountBalance" (
    "id" SERIAL NOT NULL,
    "balances" JSONB NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accountAddress" TEXT NOT NULL,

    CONSTRAINT "AccountBalance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AccountBalance_accountAddress_idx" ON "AccountBalance"("accountAddress");

-- CreateIndex
CREATE INDEX "AccountBalance_timestamp_idx" ON "AccountBalance"("timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "AccountBalance_accountAddress_timestamp_key" ON "AccountBalance"("accountAddress", "timestamp");

-- AddForeignKey
ALTER TABLE "AccountBalance" ADD CONSTRAINT "AccountBalance_accountAddress_fkey" FOREIGN KEY ("accountAddress") REFERENCES "Account"("smartAccountAddress") ON DELETE RESTRICT ON UPDATE CASCADE;
