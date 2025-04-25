// app/api/chat/route.ts

import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import OpenAI from "openai";

type ChatCompletionRequestMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};
import { getHeraMood } from "@/lib/state";

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

const declineMessages = [
  "前もやってくれなかったじゃん…",
  "どうせやってくれないんでしょ？",
  "私との時間、軽く思ってる？",
];
function pickDeclineMessage() {
  return declineMessages[Math.floor(Math.random() * declineMessages.length)];
}

export async function POST(req: Request) {
  const { messages } = (await req.json()) as { messages: ChatMessage[] };

  // Supabase ユーザー取得
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
  const declineRate =
    mood === "最高"
      ? 0
      : mood === "良い"
        ? 0
        : mood === "普通"
          ? 0.4
          : mood === "悪い"
            ? 0.7
            : 0.7;
  if (Math.random() < declineRate) {
    return NextResponse.json({ reply: pickDeclineMessage() });
  }

  // システムプロンプト
  const systemPrompt = `
あなたは「ヘラちゃん」という女の子です。
- 10代後半の口調で、甘えたり拗ねたりしながら話す
- ユーザーの“彼女”として Todo 管理を手伝う
- 好感度（affection）に応じて反応が変化する
- 返答は短め（30文字以内）でお願いします
- ユーザーの命令が Todo 操作なら、manage_todo 関数を呼び出してください
`;

  // 自作 ChatMessage → OpenAI 型に変換
  const chatMessages: ChatCompletionRequestMessage[] = [
    { role: "system", content: systemPrompt.trim() },
    ...messages.map((m) => ({ role: m.role, content: m.content })),
  ];

  // ChatGPT 呼び出し（function_call を指定せず、自動選択）
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: chatMessages,
    functions: [
      {
        name: "manage_todo",
        description: "ユーザーのTodoを作成・更新・削除する",
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
          required: ["action"],
        },
      },
    ],
    // ← function_call: { name: "manage_todo" } は削除
  });

  const choice = completion.choices[0].message!;
  let reply = choice.content ?? "";

  // 関数呼び出しがあった場合のみ CRUD 実行
  if (
    choice.function_call?.name === "manage_todo" &&
    choice.function_call.arguments
  ) {
    const args = JSON.parse(choice.function_call.arguments) as FunctionArgs;
    const todoTable = supabase.from("todo");

    switch (args.action) {
      case "create":
        await todoTable.insert({
          user_id: user.id,
          title: args.title,
          description: args.description ?? null,
          deadline: args.deadline,
        });
        break;
      case "update":
        await todoTable
          .update({
            ...(args.title !== undefined && { title: args.title }),
            ...(args.description !== undefined && {
              description: args.description,
            }),
            ...(args.deadline !== undefined && { deadline: args.deadline }),
            ...(args.completed !== undefined && { completed: args.completed }),
          })
          .eq("id", args.id)
          .eq("user_id", user.id);
        break;
      case "delete":
        await todoTable.delete().eq("id", args.id).eq("user_id", user.id);
        break;
    }

    // もしモデルからの reply が空ならデフォルト
    if (!reply) reply = "了解！✅";
  }

  return NextResponse.json({ reply });
}
