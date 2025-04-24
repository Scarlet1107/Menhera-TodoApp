// app/protected/layout.tsx
export const dynamic = "force-dynamic";

import React from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import isBetween from "dayjs/plugin/isBetween";
import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server";
import { HeraProvider, HeraStatus } from "@/lib/hera/context";
import { decideEventType } from "@/lib/hera/decideEvent";
import { computeDelta } from "@/lib/hera/computeDelta";
import { buildMessage } from "@/lib/hera/messages";
import { getHeraMood } from "@/lib/state";
import {
  ANNIVERSARY_PRESENT_OPTIONS,
  ONE_DAY_GAP_REPLACE_OPTIONS,
} from "@/constants/presents";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isBetween);

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. Supabase server-side client
  const supabase = await createClient();

  // 2. 認証ユーザー取得
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) redirect("/sign-in");

  // 3. 今日とユーザー作成日の定義
  const today = dayjs().tz("Asia/Tokyo").startOf("day");
  const createdAt = dayjs(user.created_at).tz("Asia/Tokyo");

  // 4. プロフィール取得
  const { data: profile, error: profileError } = await supabase
    .from("profile")
    .select(
      `
      affection,
      lastSeenAt:last_seen_at,
      lastActive:last_active
    `
    )
    .eq("user_id", user.id)
    .single();
  if (profileError || !profile) redirect("/sign-in");

  // 5. イベント種別・好感度計算
  const lastSeenAt = profile.lastSeenAt
    ? dayjs(profile.lastSeenAt).tz("Asia/Tokyo")
    : null;
  const lastActive = profile.lastActive
    ? dayjs(profile.lastActive).tz("Asia/Tokyo")
    : null;

  const eventType = decideEventType({
    createdAt,
    lastSeenAt,
    lastActive,
    today,
  });

  // 1) 日本時間の“いま”をUTC文字列に
  const nowUTCforQuery = dayjs().tz("Asia/Tokyo").utc().toISOString();

  // 2) supabase から delete + count を取る
  const { error: delError, count: deletedCount } = await supabase
    .from("todo")
    .delete({ count: "exact" })
    .eq("user_id", user.id)
    .eq("completed", false)
    .lt("deadline", nowUTCforQuery);

  if (delError) {
    console.error("期限切れTodo削除エラー", delError);
  }
  const DELETE_TODO_PENALTY_MULTIPLIER = 5;
  const deleteTodoPenalty =
    (deletedCount ?? 0) * DELETE_TODO_PENALTY_MULTIPLIER;

  // 好感度の変化量を計算
  const delta = computeDelta(eventType) - deleteTodoPenalty;
  let newAffection = Math.max(0, Math.min(100, profile.affection + delta));

  // 4) 好感度がゼロならバッドエンドへ
  if (newAffection === 0) {
    redirect("/protected/bad-end");
  }
  // --- 期限切れTodo自動削除ロジックここまで ---

  // 7. プロフィール更新
  const nowDate = new Date();
  const { error } = await supabase
    .from("profile")
    .update({
      affection: newAffection,
      last_seen_at: nowDate,
      last_active: nowDate,
    })
    .eq("user_id", user.id);
  if (error) {
    console.error("プロフィール更新エラー", error);
  }

  // 8. 記念日判定
  const diffDays = today.diff(createdAt.startOf("day"), "day") + 1;
  type AnnivType = "week1" | "week2" | "month" | "hundredDays" | "year";
  interface AnnivInfo {
    type: AnnivType;
    value: number;
  }
  let annivInfo: AnnivInfo | null = null;

  if (diffDays === 7) {
    annivInfo = { type: "week1", value: 1 };
  } else if (diffDays === 14) {
    annivInfo = { type: "week2", value: 2 };
  } else if (diffDays % 365 === 0) {
    annivInfo = { type: "year", value: diffDays / 365 };
  } else if (diffDays % 100 === 0) {
    annivInfo = { type: "hundredDays", value: diffDays / 100 };
  } else {
    const monthDiff = today.diff(createdAt.startOf("day"), "month");
    if (
      monthDiff >= 1 &&
      createdAt.date() === today.date() &&
      monthDiff % 12 !== 0
    ) {
      annivInfo = { type: "month", value: monthDiff };
    }
  }
  const isAnniversary = annivInfo !== null;

  // 9. ベースメッセージ
  const mood = getHeraMood(newAffection);
  const baseMessage = buildMessage(mood, eventType);

  // 10. 各種アクションとメッセージ追記
  let todoActionText = "";

  if (eventType === "same_day") {
    // 何もしない
  } else if (eventType === "one_day_gap") {
    // 1日ギャップ → Todo 書き換え
    const { data: todos } = await supabase
      .from("todo")
      .select("id,title")
      .eq("user_id", user.id);
    if (todos?.length) {
      const pick = todos[Math.floor(Math.random() * todos.length)];
      const newTitle =
        ONE_DAY_GAP_REPLACE_OPTIONS[
          Math.floor(Math.random() * ONE_DAY_GAP_REPLACE_OPTIONS.length)
        ];
      await supabase
        .from("todo")
        .update({
          title: newTitle,
          description: "私のためにがんばってくれるよね？",
        })
        .eq("id", pick.id);
      todoActionText = `あとなかなか Todo を進めてくれないから君のTodoを「${newTitle}」に書き換えておいたよ。私のためにがんばってくれる？`;
    }
  } else if (eventType === "multi_day_gap") {
    // 複数日ギャップ → Todo 削除
    const { data: todos } = await supabase
      .from("todo")
      .select("id")
      .eq("user_id", user.id);
    if (todos?.length) {
      const pick = todos[Math.floor(Math.random() * todos.length)];
      await supabase.from("todo").delete().eq("id", pick.id);
      todoActionText =
        "それとやること多すぎちゃったかな?なかなか会いに来てくれないからTodo1つ消しちゃったよ。これで毎日来てくれるよね？";
    }
  } else if (isAnniversary) {
    // anniversary & not same_day & not gap
    const isPositiveAnniv =
      eventType === "continuous_active" || eventType === "continuous_inactive";

    // ネガティブ記念日
    if (!isPositiveAnniv && annivInfo) {
      todoActionText =
        "そういえば今日は記念日だったね…記念日だけ来ればいいと思ってるの？";
    }

    // ポジティブ記念日
    if (isPositiveAnniv && annivInfo) {
      // プリセットからランダム選択して insert
      const title =
        ANNIVERSARY_PRESENT_OPTIONS[
          Math.floor(Math.random() * ANNIVERSARY_PRESENT_OPTIONS.length)
        ];
      await supabase.from("todo").insert({
        user_id: user.id,
        title: title,
        description: "私のためにがんばってくれるよね？",
        deadline: dayjs().add(1, "days").toISOString(),
      });

      // テキスト生成
      switch (annivInfo.type) {
        case "week1":
        case "week2":
          todoActionText = `${annivInfo.value}週間の記念日だね。プレゼントを用意したよ。todoを見てみてね♡`;
          break;
        case "month":
          todoActionText = `${annivInfo.value}ヶ月の記念日だね。プレゼントを用意したよ。todoを見てみてね♡`;
          break;
        case "hundredDays":
          todoActionText = `${annivInfo.value * 100}日記念日だね。プレゼントを用意したよ。todoを見てみてね♡`;
          break;
        case "year":
          todoActionText = `${annivInfo.value}年の記念日だね。プレゼントを用意したよ。todoを見てみてね♡`;
          break;
      }
    }
  }

  // 11. 最終メッセージ組み立て
  let message = todoActionText
    ? `${baseMessage}\n\n${todoActionText}`
    : baseMessage;

  // ─── 期限切れ削除のお知らせを追記 ───
  if (deletedCount && deletedCount > 0) {
    message += `\n\nあと期限切れのTodo${deletedCount}つ消しといたよ。次はちゃんと約束守ってね`;
  }

  // 12. Context に流し込み
  const status: HeraStatus = {
    affection: newAffection,
    mood,
    event: eventType,
    delta,
    message,
  };

  return <HeraProvider status={status}>{children}</HeraProvider>;
}
