// app/protected/todos/page.tsx
import { Suspense } from "react";
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
import type { Todo } from "@/lib/hera/types";
import { CompleteCheckbox } from "@/components/completeCheckbox";
import { EditTodoDialog } from "@/components/ui/editTodoDialog";
import { DeleteTodoButton } from "@/components/deleteTodoButton";
import HeraMessage from "@/components/heraMessage";
import HeraIconImage from "@/components/heraIconImage";
import { getUserClaims } from "@/utils/supabase/getUserClaims";
import { Skeleton } from "@/components/ui/skeleton";

dayjs.extend(utc);
dayjs.extend(timezone);
if (typeof dayjs.tz === "function") {
  dayjs.tz.setDefault("Asia/Tokyo");
}
dayjs.extend(isBetween);

export default function TodosPage() {
  return (
    <div className="p-4 mx-auto min-w-0 w-full max-w-4xl mb-32 md:mb-0">
      <div className="flex space-x-2 items-center">
        <HeraIconImage />
        <HeraMessage />
      </div>
      <Suspense fallback={<CreateTodoButtonSkeleton />}>
        <CreateTodoDialogLoader />
      </Suspense>
      <Suspense fallback={<TodosSkeleton />}>
        <TodosContent />
      </Suspense>
    </div>
  );
}

async function CreateTodoDialogLoader() {
  const { userId } = await getUserClaims();
  return <CreateTodoDialog userId={userId} />;
}

async function TodosContent() {
  const supabase = await createClient();
  const { userId } = await getUserClaims();

  const { data: todos, error } = await supabase
    .from("todo")
    .select("*")
    .eq("user_id", userId)
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

  return (
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
                  <CardContent>
                    <pre className="font-sans text-base wrap-break-word whitespace-pre-wrap">
                      {todo.description}
                    </pre>
                  </CardContent>
                )}
                <div
                  className={`absolute ${todo.description ? "bottom-6" : "bottom-2"}  right-4`}
                >
                  <CompleteCheckbox
                    id={todo.id}
                    completed={todo.completed}
                    userId={userId}
                    updateAffection={updateAffection}
                  />
                </div>
                <>
                  <div
                    className={`absolute ${todo.description ? "top-4" : "top-2"} right-16`}
                  >
                    <EditTodoDialog
                      todo={todo}
                      updateAffection={updateAffection}
                    />
                  </div>
                  <div
                    className={`absolute ${todo.description ? "top-4" : "top-2"} right-4`}
                  >
                    <DeleteTodoButton
                      todoId={todo.id}
                      userId={userId}
                      updateAffection={updateAffection}
                    />
                  </div>
                </>
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
                <CardContent className="whitespace-pre-line wrap-break-word">
                  <pre className="font-sans text-base wrap-break-word whitespace-pre-wrap">
                    {todo.description}
                  </pre>
                </CardContent>
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
  );
}

function CreateTodoButtonSkeleton() {
  return <Skeleton className="mt-6 h-12 w-44 rounded-xl" />;
}

// Todoの読み込み中に表示するスケルトン
function TodosSkeleton() {
  return (
    <div className="mt-6 space-y-4">
      <Skeleton className="h-10 w-full max-w-3xl mx-auto rounded-lg" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <Card key={idx} className="w-full relative overflow-hidden">
            <CardHeader>
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="mt-2 h-4 w-1/2" />
            </CardHeader>
            {idx % 2 !== 0 && (
              <CardContent>
                <Skeleton className="h-3 w-full" />
                <Skeleton className="mt-2 h-3 w-3/4" />
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
