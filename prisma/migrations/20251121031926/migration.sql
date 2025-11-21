/*
  Warnings:

  - You are about to drop the column `key` on the `item` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[slot,image_filename]` on the table `item` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `image_filename` to the `item` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "item_slot_key_key";

-- AlterTable
-- ALTER TABLE "item" DROP COLUMN "key",
-- ADD COLUMN     "image_filename" TEXT NOT NULL,

ALTER TABLE "item" RENAME COLUMN "key" TO "image_filename";
ALTER TABLE "item" ADD COLUMN "preview_image_filename" TEXT;


-- CreateIndex
CREATE UNIQUE INDEX "item_slot_image_filename_key" ON "item"("slot", "image_filename");
