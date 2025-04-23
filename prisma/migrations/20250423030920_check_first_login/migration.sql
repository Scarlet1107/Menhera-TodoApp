-- AlterTable
ALTER TABLE "profile" ALTER COLUMN "last_active" DROP NOT NULL,
ALTER COLUMN "last_active" DROP DEFAULT,
ALTER COLUMN "last_seen_at" DROP NOT NULL,
ALTER COLUMN "last_seen_at" DROP DEFAULT;
