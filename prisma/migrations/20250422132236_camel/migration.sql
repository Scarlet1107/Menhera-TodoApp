/*
  Warnings:

  - The primary key for the `profile` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `lastActive` on the `profile` table. All the data in the column will be lost.
  - You are about to drop the column `lastSeenAt` on the `profile` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `profile` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `todo` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `todo` table. All the data in the column will be lost.
  - Added the required column `user_id` to the `profile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `todo` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "todo" DROP CONSTRAINT "todo_userId_fkey";

-- DropIndex
DROP INDEX "todo_userId_idx";

-- AlterTable
ALTER TABLE "profile" DROP CONSTRAINT "profile_pkey",
DROP COLUMN "lastActive",
DROP COLUMN "lastSeenAt",
DROP COLUMN "userId",
ADD COLUMN     "last_active" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "last_seen_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "user_id" TEXT NOT NULL,
ADD CONSTRAINT "profile_pkey" PRIMARY KEY ("user_id");

-- AlterTable
ALTER TABLE "todo" DROP COLUMN "createdAt",
DROP COLUMN "userId",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "user_id" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "todo_user_id_idx" ON "todo"("user_id");

-- AddForeignKey
ALTER TABLE "todo" ADD CONSTRAINT "todo_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profile"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
