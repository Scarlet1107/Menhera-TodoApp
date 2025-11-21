-- AlterEnum
ALTER TYPE "CoinLogType" ADD VALUE 'shop_purchase';

-- AlterTable
ALTER TABLE "item" ADD COLUMN     "price" INTEGER;
