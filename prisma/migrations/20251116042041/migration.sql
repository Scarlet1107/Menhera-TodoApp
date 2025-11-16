-- DropForeignKey
ALTER TABLE "coin_log" DROP CONSTRAINT "coin_log_todo_id_fkey";

-- AddForeignKey
ALTER TABLE "coin_log" ADD CONSTRAINT "coin_log_todo_id_fkey" FOREIGN KEY ("todo_id") REFERENCES "todo"("id") ON DELETE SET NULL ON UPDATE CASCADE;
