import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { Configuration, OpenAIApi } from "openai";

export async function POST(req: Request) {
  const { messages } = await req.json();
  const supabase = await createClient();
  const user = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profile")
    .select("affection")
    .eq("user_id", user.data.user!.id)
    .single();

  // ムードに応じた拒否判定
  const affection = profile?.affection ?? 0;
  const mood = affection >= 80 ? 100 : affection >= 60 ? 40 : 70;
  if (Math.random() * 100 < mood) {
    return NextResponse.json({ reply: "今はちょっと…ごめんね。" });
  }

  const openai = new OpenAIApi(
    new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    })
  );
  const res = await openai.createChatCompletion({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "あなたはヘラちゃんです…" },
      ...messages,
    ],
  });
  const reply = res.data.choices[0].message?.content;
  return NextResponse.json({ reply });
}
