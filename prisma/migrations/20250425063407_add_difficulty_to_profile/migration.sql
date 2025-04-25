-- CreateEnum
CREATE TYPE "Difficulty" AS ENUM ('casual', 'hard');

-- AlterTable
ALTER TABLE "profile" ADD COLUMN     "difficulty" "Difficulty" NOT NULL DEFAULT 'casual';
