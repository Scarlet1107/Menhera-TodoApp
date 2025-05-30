export const runtime = "nodejs";
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

const declinePhrases: Record<
  "良い" | "普通" | "悪い" | "非常に悪い",
  string[]
> = {
  良い: [
    "ごめん、ちょっと手が離せなくて…",
    "今ちょっとムリかも、ごめんね…",
    "ごめん、あとででもいいかな…？",
  ],
  普通: [
    "ごめん、今あんまり気分よくなくて…",
    "今ちょっとしんどいかも…ごめん",
    "今はお話しする気分じゃなくて…ごめんね",
  ],
  悪い: [
    "今しんどくてお話ししたくないかも…ごめん…",
    "今はちょっと無理そう…",
    "ごめん、なんか憂鬱で今はそっとしてほしい",
  ],
  非常に悪い: [
    "無理して私と話さなくてもいいんだよ…",
    "私と話してもきっと楽しくないでしょ…",
    "気分が落ち込んで戻らなくて…ごめんね",
  ],
};

export async function POST(req: Request) {
  const { messages } = (await req.json()) as { messages: ChatMessage[] };

  // Supabase 認証
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 好感度取得 & ムードによる拒否判定
  const { data: prof } = await supabase
    .from("profile")
    .select("affection")
    .eq("user_id", user.id)
    .single();
  let affection = prof?.affection ?? 0;
  const mood = getHeraMood(affection);
  let declineRate: number;
  switch (mood) {
    case "最高":
      declineRate = 0;
      break;
    case "良い":
      declineRate = 0.1;
      break;
    case "普通":
      declineRate = 0.2;
      break;
    case "悪い":
      declineRate = 0.3;
      break;
    case "非常に悪い":
      declineRate = 0.4;
      break;
    default:
      declineRate = 0;
  }
  if (Math.random() < declineRate && mood !== "最高") {
    const phrases = declinePhrases[mood];
    const randomReply = phrases[Math.floor(Math.random() * phrases.length)];
    // 断り時も同じ形で返す
    return NextResponse.json(
      { reply: randomReply, affection, delta: 0 },
      { status: 200 }
    );
  }

  // 未完了 Todo を取得
  const { data: todoList, error: listErr } = await supabase
    .from("todo")
    .select("id,title,deadline")
    .eq("user_id", user.id)
    .eq("completed", false);
  if (listErr) console.error("fetch todoList failed:", listErr);

  const todosForModel = (todoList ?? []).map((t) => ({
    id: t.id,
    title: t.title,
    deadline: t.deadline,
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
- 期限について入力がなければ48時間後に設定してください

次のツールを提供します。  
ツール名: manage_todo  
説明: ユーザーのTodoを作成・更新・削除する  
引数は JSON 形式で、deadline は必ず ISO8601 形式で返してください。
`;

  const chatMessages: ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt },
    {
      role: "system",
      content:
        "以下は未完了のTodo一覧です。必ずこの中から操作対象のidを選んでください：\n" +
        JSON.stringify(
          todosForModel.map((t) => ({ id: t.id, title: t.title })),
          null,
          2
        ),
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

  // 関数呼び出しがあれば実行
  if (choice.tool_calls?.length) {
    const call = choice.tool_calls[0];
    const raw = JSON.parse(call.function.arguments!) as FunctionArgs;

    // helper: 好感度更新
    const updateAff = async (delta: number) => {
      const newAffection = Math.min(100, Math.max(0, affection + delta));
      console.log("new affection:", newAffection);
      await supabase
        .from("profile")
        .update({ affection: newAffection })
        .eq("user_id", user.id);
      affection = newAffection;
    };

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
      await updateAff(1);
      reply = "作ったよ！";
    }

    // update
    if (raw.action === "update") {
      let targetId = raw.id;
      if (!isUuid(targetId)) {
        const { data: m } = await supabase
          .from("todo")
          .select("id,title,deadline")
          .eq("user_id", user.id)
          .eq("completed", false)
          .ilike("title", `%${targetId}%`)
          .limit(1)
          .maybeSingle();
        if (m) targetId = m.id;
        else {
          return NextResponse.json(
            {
              reply:
                "どのTodoか分からないよ…下から選んで番号かUUIDで教えてね。\n" +
                todosForModel.map((x) => `${x.id}: ${x.title}`).join("\n"),
            },
            { status: 200 }
          );
        }
      }

      const { data: before } = await supabase
        .from("todo")
        .select("deadline")
        .eq("id", targetId)
        .single();

      const upd: any = {};
      if (raw.title) upd.title = raw.title;
      if (raw.description) upd.description = raw.description;
      if (raw.deadline) upd.deadline = dayjs(raw.deadline).toISOString();
      if (raw.completed !== undefined) upd.completed = raw.completed;

      const { error: uErr } = await supabase
        .from("todo")
        .update(upd)
        .eq("id", targetId)
        .eq("user_id", user.id);
      if (uErr) console.error("update failed:", uErr);
      else {
        if (
          raw.deadline &&
          before?.deadline &&
          dayjs(raw.deadline).isAfter(dayjs(before.deadline))
        ) {
          await updateAff(-3);
        }
        reply = "更新したよ！";
      }
    }

    // delete
    if (raw.action === "delete") {
      let targetId = raw.id;
      if (!isUuid(targetId)) {
        const { data: m } = await supabase
          .from("todo")
          .select("id,title")
          .eq("user_id", user.id)
          .eq("completed", false)
          .ilike("title", `%${targetId}%`)
          .limit(1)
          .maybeSingle();
        if (m) targetId = m.id;
        else {
          return NextResponse.json(
            {
              reply:
                "どのTodoか分からないよ…下から選んで番号かUUIDで教えてね。\n" +
                todosForModel.map((x) => `${x.id}: ${x.title}`).join("\n"),
            },
            { status: 200 }
          );
        }
      }

      const { error: dErr } = await supabase
        .from("todo")
        .delete()
        .eq("id", targetId)
        .eq("user_id", user.id);
      if (dErr) {
        console.error("delete failed:", dErr);
        reply = "削除できなかった…";
      } else {
        await updateAff(-5);
        reply = "削除したよ！";
      }
    }

    // ツール実行結果を GPT に再投入
    const delta = affection - (prof?.affection ?? 0);
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

    return NextResponse.json({ reply, affection, delta }, { status: 200 });
  }

  return NextResponse.json({ reply, affection, delta: 0 }, { status: 200 });
}
