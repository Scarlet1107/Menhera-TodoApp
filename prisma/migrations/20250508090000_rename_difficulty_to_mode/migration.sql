-- Temporarily drop the default to avoid conflicts while renaming enum values
ALTER TABLE "profile" ALTER COLUMN "difficulty" DROP DEFAULT;

-- Rename enum values to align with Dark Mode terminology
ALTER TYPE "Difficulty" RENAME VALUE 'casual' TO 'normal';
ALTER TYPE "Difficulty" RENAME VALUE 'hard' TO 'dark';

-- Rename enum itself to reflect the new meaning
ALTER TYPE "Difficulty" RENAME TO "Mode";

-- Rename column on profile table
ALTER TABLE "profile" RENAME COLUMN "difficulty" TO "mode";

-- Existing data should default to normal mode after the rename
UPDATE "profile" SET "mode" = 'normal';

-- Ensure the new column default matches the renamed enum
ALTER TABLE "profile" ALTER COLUMN "mode" SET DEFAULT 'normal';
