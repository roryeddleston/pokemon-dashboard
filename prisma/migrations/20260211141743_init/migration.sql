-- CreateTable
CREATE TABLE "Holding" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,
    "cardName" TEXT NOT NULL,
    "setName" TEXT NOT NULL,
    "grade" TEXT,
    "purchasePrice" DOUBLE PRECISION NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Holding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PriceSnapshot" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "holdingId" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PriceSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Holding_ownerId_idx" ON "Holding"("ownerId");

-- CreateIndex
CREATE INDEX "Holding_ownerId_createdAt_idx" ON "Holding"("ownerId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Holding_ownerId_cardId_grade_key" ON "Holding"("ownerId", "cardId", "grade");

-- CreateIndex
CREATE INDEX "PriceSnapshot_ownerId_idx" ON "PriceSnapshot"("ownerId");

-- CreateIndex
CREATE INDEX "PriceSnapshot_holdingId_capturedAt_idx" ON "PriceSnapshot"("holdingId", "capturedAt");

-- AddForeignKey
ALTER TABLE "PriceSnapshot" ADD CONSTRAINT "PriceSnapshot_holdingId_fkey" FOREIGN KEY ("holdingId") REFERENCES "Holding"("id") ON DELETE CASCADE ON UPDATE CASCADE;
