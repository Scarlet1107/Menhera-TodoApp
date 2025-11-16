-- Update foreign key constraint to add ON DELETE SET NULL
ALTER TABLE "coin_log" DROP CONSTRAINT "coin_log_todo_id_fkey";
ALTER TABLE "coin_log" ADD CONSTRAINT "coin_log_todo_id_fkey" FOREIGN KEY ("todo_id") REFERENCES "todo"("id") ON DELETE SET NULL;
