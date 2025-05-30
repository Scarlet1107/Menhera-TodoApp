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
import HeraMessage from "@/components/heraMessage";
import HeraIconImage from "@/components/heraIconImage";

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
    .eq("user_id", userId)
    .order("deadline", { ascending: true });
  if (error)
    return <div className="p-4 text-red-500">エラー: {error.message}</div>;

  const { data: profile } = await supabase
    .from("profile")
    .select("difficulty")
    .eq("user_id", user.id)
    .single();
  const isHard = profile?.difficulty === "hard";

  const list: Todo[] = todos ?? [];
  const todayStart = dayjs().startOf("day");

  const active = list.filter((t) => {
    const dl = dayjs.utc(t.deadline).tz();
    return !t.completed && !dl.isBefore(todayStart);
  });
  const completed = list.filter((t) => t.completed);
  (t: { completed: any }) => t.completed;

  return (
    <div className="p-4 mx-auto min-w-0 w-full max-w-4xl mb-32 md:mb-0">
      <div className="flex space-x-2 items-center">
        <HeraIconImage />
        <HeraMessage />
      </div>
      {!isHard && <CreateTodoDialog userId={userId} />}
      <Tabs defaultValue="active" className="mt-4">
        <TabsList className="w-full max-w-3xl mx-auto">
          <TabsTrigger value="active">未完了</TabsTrigger>
          <TabsTrigger value="completed">完了</TabsTrigger>
        </TabsList>
        <TabsContent value="active">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {active.length > 0 ? (
              active.map((todo) => (
                <Card key={todo.id} className="w-full relative">
                  <CardHeader className="relative w-3/4">
                    <CardTitle>{todo.title}</CardTitle>
                    <CardDescription>
                      {dayjs.utc(todo.deadline).tz().format("YYYY-MM-DD")}
                    </CardDescription>
                  </CardHeader>
                  {todo.description && (
                    <CardContent>{todo.description}</CardContent>
                  )}
                  <div className={`absolute ${todo.description ? "bottom-6" : "bottom-2"}  right-4`}>
                    <CompleteCheckbox
                      id={todo.id}
                      completed={todo.completed}
                      userId={userId}
                      updateAffection={updateAffection}
                    />
                  </div>
                  {!isHard && (
                    <>
                      <div className={`absolute ${todo.description ? "top-4" : "top-2"} right-16`}>
                        <EditTodoDialog
                          todo={todo}
                          updateAffection={updateAffection}
                        />
                      </div>
                      <div className={`absolute ${todo.description ? "top-4" : "top-2"} right-4`}>
                        <DeleteTodoButton
                          todoId={todo.id}
                          userId={userId}
                          updateAffection={updateAffection}
                        />
                      </div>
                    </>
                  )}
                </Card>
              ))
            ) : (
              <div className="text-gray-700 bg-white/80 dark:text-white px-2 text-lg dark:bg-stone-800/70 rounded-xl text-center col-span-full flex items-center justify-center min-h-[200px]">
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
                <div className="absolute bottom-4 right-4">
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
