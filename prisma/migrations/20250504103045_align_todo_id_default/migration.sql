-- Align the Prisma migration history with the Supabase schema.
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

ALTER TABLE "todo"
ALTER COLUMN "id" SET DEFAULT uuid_generate_v4();
