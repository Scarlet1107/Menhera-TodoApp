// app/api/todos/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

type Command =
  | { action: "create"; title: string; description?: string; deadline: string }
  | { action: "delete"; id: string }
  | {
      action: "update";
      id: string;
      title?: string;
      description?: string;
      deadline?: string;
      completed?: boolean;
    };

export async function POST(req: Request) {
  const { command } = (await req.json()) as { command: Command };
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const uid = user.id;
  console.log("todos api was called", command);

  // profile から現在の affection を取得
  const { data: prof } = await supabase
    .from("profile")
    .select("affection")
    .eq("user_id", uid)
    .single();
  let affection = prof?.affection ?? 0;

  // delta 計算用ユーティリティ
  const clamp = (n: number) => Math.min(100, Math.max(0, n));

  // CRUD 処理
  switch (command.action) {
    case "create":
      await supabase.from("todo").insert({
        user_id: uid,
        title: command.title,
        description: command.description ?? null,
        deadline: command.deadline,
      });
      affection = clamp(affection + 1);
      break;

    case "delete":
      await supabase
        .from("todo")
        .delete()
        .eq("id", command.id)
        .eq("user_id", uid);
      affection = clamp(affection - 5);
      break;

    case "update":
      // 変更前のレコード取得
      const { data: before } = await supabase
        .from("todo")
        .select("deadline,completed")
        .eq("id", command.id)
        .eq("user_id", uid)
        .single();
      if (!before)
        return NextResponse.json({ error: "Not found" }, { status: 404 });

      // 実際の更新
      const updates: any = {};
      if (command.title !== undefined) updates.title = command.title;
      if (command.description !== undefined)
        updates.description = command.description;
      if (command.deadline !== undefined) updates.deadline = command.deadline;
      if (command.completed !== undefined)
        updates.completed = command.completed;
      await supabase
        .from("todo")
        .update(updates)
        .eq("id", command.id)
        .eq("user_id", uid);

      // 好感度デルタ
      if (
        command.deadline &&
        new Date(command.deadline) > new Date(before.deadline)
      ) {
        affection = clamp(affection - 3);
      }
      if (command.completed === true && before.completed === false) {
        affection = clamp(affection + 3);
      }
      break;
  }

  // profile を更新
  await supabase.from("profile").update({ affection }).eq("user_id", uid);

  return NextResponse.json({ ok: true, affection });
}
