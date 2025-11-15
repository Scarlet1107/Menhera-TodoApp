/*
  Warnings:

  - A unique constraint covering the columns `[slot,key]` on the table `item` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "item_key_key";

-- CreateIndex
CREATE UNIQUE INDEX "item_slot_key_key" ON "item"("slot", "key");
