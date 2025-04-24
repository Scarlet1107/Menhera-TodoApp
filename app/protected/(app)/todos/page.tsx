// app/protected/todos/page.tsx
import React from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import isBetween from "dayjs/plugin/isBetween";
import { createClient } from "@/utils/supabase/server";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { updateAffection } from "./actions";
import { CreateTodoDialog } from "@/components/createTodoDialog";
import { redirect } from "next/navigation";
import type { Todo } from "@/lib/hera/types";
import { CompleteCheckbox } from "@/components/completeCheckbox";
import { EditTodoDialog } from "@/components/ui/editTodoDialog";
import { DeleteTodoButton } from "@/components/deleteTodoButton";

dayjs.extend(utc);
dayjs.extend(timezone);
if (typeof dayjs.tz === "function") {
  dayjs.tz.setDefault("Asia/Tokyo");
}
dayjs.extend(isBetween);

export default async function TodosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");
  const userId = user.id;

  const { data: todos, error } = await supabase
    .from("todo")
    .select("*")
    .order("deadline", { ascending: true });
  if (error)
    return <div className="p-4 text-red-500">エラー: {error.message}</div>;

  const list: Todo[] = todos ?? [];
  const todayStart = dayjs().startOf("day");

  const active = list.filter((t) => {
    const dl = dayjs.utc(t.deadline).tz();
    return !t.completed && !dl.isBefore(todayStart);
  });
  const completed = list.filter((t) => t.completed);
  (t: { completed: any }) => t.completed;

  return (
    <div className="p-4 mx-auto w-full max-w-4xl">
      <CreateTodoDialog userId={userId} updateAffection={updateAffection} />
      <Tabs defaultValue="active" className="mt-4">
        <TabsList className="w-full max-w-3xl mx-auto">
          <TabsTrigger value="active">未完了</TabsTrigger>
          <TabsTrigger value="completed">完了</TabsTrigger>
        </TabsList>
        <TabsContent value="active">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {active.length > 0 ? (
              active.map((todo) => (
                <Card key={todo.id} className="w-full">
                  <CardHeader className="relative">
                    <CardTitle>{todo.title}</CardTitle>
                    <CardDescription>
                      {dayjs.utc(todo.deadline).tz().format("YYYY-MM-DD")}
                    </CardDescription>
                    <div className="absolute right-2 top-2 flex space-x-1">
                      <CompleteCheckbox
                        id={todo.id}
                        completed={todo.completed}
                        userId={userId}
                        updateAffection={updateAffection}
                      />
                      <EditTodoDialog
                        todo={todo}
                        updateAffection={updateAffection}
                      />
                      <DeleteTodoButton
                        todoId={todo.id}
                        userId={userId}
                        updateAffection={updateAffection}
                      />
                    </div>
                  </CardHeader>
                  {todo.description && (
                    <CardContent>{todo.description}</CardContent>
                  )}
                </Card>
              ))
            ) : (
              <div className="text-gray-500 text-center col-span-full flex items-center justify-center min-h-[200px]">
                現在タスクはありません。Todoを作成してヘラちゃんの好感度を上げましょう
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="completed">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {completed.map((todo) => (
              <Card key={todo.id} className="w-full opacity-70 relative">
                <CardHeader>
                  <CardTitle>{todo.title}</CardTitle>
                  <CardDescription>完了済み</CardDescription>
                </CardHeader>
                {todo.description && (
                  <CardContent>{todo.description}</CardContent>
                )}
                <div className="absolute top-2 right-2">
                  <CompleteCheckbox
                    id={todo.id}
                    completed={todo.completed}
                    userId={userId}
                    updateAffection={updateAffection}
                  />
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
