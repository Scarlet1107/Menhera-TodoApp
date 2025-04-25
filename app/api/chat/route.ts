// app/api/chat/route.ts

import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { getHeraMood } from "@/lib/state";
import { validate as isUuid } from "uuid";

dayjs.extend(utc);
dayjs.extend(timezone);

type ChatMessage = { role: "system" | "user" | "assistant"; content: string };
type FunctionArgs =
  | { action: "create"; title: string; description?: string; deadline: string }
  | {
      action: "update";
      id: string;
      title?: string;
      description?: string;
      deadline?: string;
      completed?: boolean;
    }
  | { action: "delete"; id: string };

export async function POST(req: Request) {
  const { messages } = (await req.json()) as { messages: ChatMessage[] };

  // Supabase 認証
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // 好感度→ムード→拒否判定
  const { data: prof } = await supabase
    .from("profile")
    .select("affection")
    .eq("user_id", user.id)
    .single();
  const affection = prof?.affection ?? 0;
  const mood = getHeraMood(affection);
  const declineRate = mood === "普通" ? 0.4 : mood === "悪い" ? 0.7 : 0;
  if (Math.random() < declineRate)
    return NextResponse.json({ reply: "ごめん、今ちょっと…" });

  // 未完了 Todo を取得
  const { data: todoList, error: listErr } = await supabase
    .from("todo")
    .select("id,title")
    .eq("user_id", user.id)
    .eq("completed", false);
  if (listErr) console.error("fetch todoList failed:", listErr);

  const todosForModel = (todoList ?? []).map((t) => ({
    id: t.id,
    title: t.title,
  }));

  // システムプロンプト
  const nowJst = dayjs().tz("Asia/Tokyo").format();
  const systemPrompt = `
【現在日時（JST）】${nowJst}
あなたは「ヘラちゃん」という女の子です。
- 10代後半の口調で、甘えたり拗ねたりしながら話す
- ユーザーの“彼女”として Todo 管理を手伝う
- 好感度（affection）に応じて反応が変化する
- 返答は短め（30文字以内）でお願いします

次のツールを提供します。  
ツール名: manage_todo  
説明: ユーザーのTodoを作成・更新・削除する  
引数は JSON 形式で、deadline は必ず ISO8601 形式で返してください。
`;

  // ChatGPT に渡すメッセージ
  const chatMessages: ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt },
    {
      role: "system",
      content:
        "以下は未完了のTodo一覧です。必ずこの中から操作対象のidを選んでください：\n" +
        JSON.stringify(todosForModel, null, 2),
    },
    ...messages.map((m) => ({ role: m.role, content: m.content })),
  ];

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  // 1) GPT にツール定義を渡して判定
  const first = await openai.chat.completions.create({
    model: "gpt-4",
    messages: chatMessages,
    tools: [
      {
        type: "function",
        function: {
          name: "manage_todo",
          description: "TodoのCRUD",
          parameters: {
            type: "object",
            properties: {
              action: { type: "string", enum: ["create", "update", "delete"] },
              id: { type: "string" },
              title: { type: "string" },
              description: { type: "string" },
              deadline: { type: "string" },
              completed: { type: "boolean" },
            },
            required: ["action", "id"],
          },
        },
      },
    ],
    tool_choice: "auto",
  });

  const choice = first.choices[0].message!;
  let reply = choice.content ?? "";

  // 2) ツール呼び出しがあれば実行
  if (choice.tool_calls?.length) {
    const call = choice.tool_calls[0];
    const raw = JSON.parse(call.function.arguments!) as FunctionArgs;

    // create
    if (raw.action === "create") {
      const due = dayjs(raw.deadline).isValid()
        ? dayjs(raw.deadline).toISOString()
        : dayjs().tz("Asia/Tokyo").add(1, "day").hour(9).toISOString();
      await supabase.from("todo").insert({
        user_id: user.id,
        title: raw.title,
        description: raw.description ?? null,
        deadline: due,
      });
      reply = "作ったよ！";
    }

    // update / delete は id 必須
    if (raw.action === "update" || raw.action === "delete") {
      let targetId = raw.id;

      // UUID でなければタイトルあいまい検索（case-insensitive）
      if (!isUuid(targetId)) {
        const { data: m, error: selErr } = await supabase
          .from("todo")
          .select("id,title")
          .eq("user_id", user.id)
          .eq("completed", false)
          .ilike("title", `%${targetId}%`) // ← .ilike に変更 :contentReference[oaicite:1]{index=1}
          .limit(1)
          .maybeSingle();
        if (selErr) console.error("lookup failed:", selErr);
        if (m) {
          targetId = m.id;
        } else {
          return NextResponse.json({
            reply:
              "どのTodoか分からないよ…下から選んで番号かUUIDで教えてね。\n" +
              todosForModel.map((x) => `${x.id}: ${x.title}`).join("\n"),
          });
        }
      }

      if (raw.action === "update") {
        const upd: any = {};
        if (raw.title) upd.title = raw.title;
        if (raw.description) upd.description = raw.description;
        if (raw.deadline) upd.deadline = dayjs(raw.deadline).toISOString();
        if (raw.completed !== undefined) upd.completed = raw.completed;
        const { error: uErr } = await supabase
          .from("todo")
          .update(upd)
          .eq("id", targetId)
          .eq("user_id", user.id)
          .select();
        if (uErr) console.error("update failed:", uErr);
        else reply = "更新したよ！";
      }

      if (raw.action === "delete") {
        const { error: dErr } = await supabase
          .from("todo")
          .delete()
          .eq("id", targetId)
          .eq("user_id", user.id)
          .select();
        if (dErr) {
          console.error("delete failed:", dErr);
          reply = "削除できなかった…";
        } else {
          reply = "削除したよ！";
        }
      }
    }

    // 3) ツール実行結果を GPT に再投入
    const toolMsg: ChatCompletionMessageParam = {
      role: "tool",
      content: JSON.stringify({ success: true }),
      tool_call_id: call.id,
    };
    const second = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [...chatMessages, choice, toolMsg],
    });
    reply = second.choices[0].message?.content ?? reply;
  }

  return NextResponse.json({ reply });
}
