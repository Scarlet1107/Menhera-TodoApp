-- CreateEnum
CREATE TYPE "TodoDifficulty" AS ENUM ('easy', 'normal', 'hard');

-- CreateEnum
CREATE TYPE "ItemCategory" AS ENUM ('cosmetic', 'consumable');

-- CreateEnum
CREATE TYPE "ItemSlot" AS ENUM ('frontHair', 'backHair', 'clothes', 'none');

-- CreateEnum
CREATE TYPE "CoinLogType" AS ENUM ('todo_reward', 'anniversary', 'gacha', 'manual_adjust');

-- AlterTable
ALTER TABLE "profile" ADD COLUMN     "back_hair_item_id" UUID,
ADD COLUMN     "clothes_item_id" UUID,
ADD COLUMN     "front_hair_item_id" UUID,
ADD COLUMN     "menhera_coin" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "last_active" SET DATA TYPE TIMESTAMPTZ(6),
ALTER COLUMN "last_seen_at" SET DATA TYPE TIMESTAMPTZ(6);

-- AlterTable
ALTER TABLE "todo" ADD COLUMN     "difficulty" "TodoDifficulty" NOT NULL DEFAULT 'normal',
ADD COLUMN     "reward_given" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "deadline" SET DATA TYPE TIMESTAMPTZ(6),
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMPTZ(6);

-- CreateTable
CREATE TABLE "item" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" "ItemCategory" NOT NULL,
    "slot" "ItemSlot" NOT NULL DEFAULT 'none',
    "affection_gain" INTEGER NOT NULL DEFAULT 0,
    "gacha_weight" INTEGER NOT NULL DEFAULT 0,
    "is_unique" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_item" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "user_id" UUID NOT NULL,
    "item_id" UUID NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "acquired_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coin_log" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "user_id" UUID NOT NULL,
    "amount" INTEGER NOT NULL,
    "type" "CoinLogType" NOT NULL,
    "todo_id" UUID,
    "item_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "coin_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "item_key_key" ON "item"("key");

-- CreateIndex
CREATE INDEX "user_item_user_id_idx" ON "user_item"("user_id");

-- CreateIndex
CREATE INDEX "user_item_item_id_idx" ON "user_item"("item_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_item_user_id_item_id_key" ON "user_item"("user_id", "item_id");

-- CreateIndex
CREATE INDEX "coin_log_user_id_idx" ON "coin_log"("user_id");

-- CreateIndex
CREATE INDEX "coin_log_todo_id_idx" ON "coin_log"("todo_id");

-- CreateIndex
CREATE INDEX "coin_log_item_id_idx" ON "coin_log"("item_id");

-- AddForeignKey
ALTER TABLE "profile" ADD CONSTRAINT "profile_front_hair_item_id_fkey" FOREIGN KEY ("front_hair_item_id") REFERENCES "item"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profile" ADD CONSTRAINT "profile_back_hair_item_id_fkey" FOREIGN KEY ("back_hair_item_id") REFERENCES "item"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profile" ADD CONSTRAINT "profile_clothes_item_id_fkey" FOREIGN KEY ("clothes_item_id") REFERENCES "item"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_item" ADD CONSTRAINT "user_item_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profile"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_item" ADD CONSTRAINT "user_item_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coin_log" ADD CONSTRAINT "coin_log_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profile"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coin_log" ADD CONSTRAINT "coin_log_todo_id_fkey" FOREIGN KEY ("todo_id") REFERENCES "todo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coin_log" ADD CONSTRAINT "coin_log_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "item"("id") ON DELETE SET NULL ON UPDATE CASCADE;
