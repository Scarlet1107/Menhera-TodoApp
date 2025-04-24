// app/protected/todos/page.tsx
import React from "react";
import dayjs from "dayjs";
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
import { Todo } from "@/lib/hera/types";
import { CompleteCheckbox } from "@/components/completeCheckbox";
import { CreateTodoDialog } from "@/components/CreateTodoDialog";
import { redirect } from "next/navigation";
import { updateAffection } from "./actions";

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
    .select("id, title, description, deadline, completed")
    .order("deadline", { ascending: true });

  if (error)
    return <div className="p-4 text-red-500">エラー: {error.message}</div>;

  const list: Todo[] = todos ?? [];
  const todayStart = dayjs().startOf("day");
  const tomorrowStart = todayStart.add(1, "day");

  const todaysTodos = list.filter(
    (t) =>
      !t.completed &&
      dayjs(t.deadline).isBetween(todayStart, tomorrowStart, null, "[]")
  );
  const upcomingTodos = list.filter(
    (t) => !t.completed && !dayjs(t.deadline).isBefore(tomorrowStart)
  );
  const completedTodos = list.filter((t) => t.completed);

  return (
    <div className="p-4 w-full max-w-4xl mx-auto">
      <Tabs defaultValue="incomplete" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="incomplete" className="w-full text-center">
            未完了
          </TabsTrigger>
          <TabsTrigger value="completed" className="w-full text-center">
            完了
          </TabsTrigger>
        </TabsList>

        <TabsContent value="incomplete" className="w-full space-y-6">
          {todaysTodos.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-2">今日のタスク</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {todaysTodos.map((todo) => (
                  <Card key={todo.id} className="relative">
                    <CardHeader>
                      <CardTitle>{todo.title}</CardTitle>
                      <CardDescription>
                        {dayjs(todo.deadline).format("YYYY-MM-DD")}
                      </CardDescription>
                    </CardHeader>
                    {todo.description && (
                      <CardContent>{todo.description}</CardContent>
                    )}
                    <div className="absolute top-2 right-2">
                      <CompleteCheckbox
                        id={todo.id}
                        completed={todo.completed}
                      />
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingTodos.map((todo) => (
              <Card key={todo.id} className="relative">
                <CardHeader>
                  <CardTitle>{todo.title}</CardTitle>
                  <CardDescription>
                    {dayjs(todo.deadline).format("YYYY-MM-DD")}
                  </CardDescription>
                </CardHeader>
                {todo.description && (
                  <CardContent>{todo.description}</CardContent>
                )}
                <div className="absolute top-2 right-2">
                  <CompleteCheckbox id={todo.id} completed={todo.completed} />
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="w-full">
          {completedTodos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {completedTodos.map((todo) => (
                <Card key={todo.id} className="opacity-70 relative">
                  <CardHeader>
                    <CardTitle>{todo.title}</CardTitle>
                    <CardDescription>完了済み</CardDescription>
                  </CardHeader>
                  {todo.description && (
                    <CardContent>{todo.description}</CardContent>
                  )}
                  <div className="absolute top-2 right-2">
                    <CompleteCheckbox id={todo.id} completed={todo.completed} />
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <p>完了済みのタスクはありません。</p>
          )}
        </TabsContent>
      </Tabs>
      {/* 好感度更新アクションを渡す */}
      <CreateTodoDialog userId={userId} updateAffection={updateAffection} />
    </div>
  );
}
