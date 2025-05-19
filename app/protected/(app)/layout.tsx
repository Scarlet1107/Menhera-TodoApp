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
import DynamicBackground from "@/components/dynamicBackground";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isBetween);

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    redirect("/sign-in");
  }

  const today = dayjs().tz("Asia/Tokyo").startOf("day");
  const createdAt = dayjs(user.created_at).tz("Asia/Tokyo");

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
  if (profileError || !profile) {
    console.error("プロフィール取得エラー", profileError);
    redirect("/sign-in");
  }

  const lastSeenAt = profile.lastSeenAt
    ? dayjs.utc(profile.lastSeenAt).tz("Asia/Tokyo").startOf("day")
    : null;
  const lastActive = profile.lastActive
    ? dayjs.utc(profile.lastActive).tz("Asia/Tokyo").startOf("day")
    : null;

  const eventType = decideEventType({
    createdAt,
    lastSeenAt,
    lastActive,
    today,
  });

  const nowUTCforQuery = dayjs().tz("Asia/Tokyo").utc().toISOString();
  const { error: delError, count: deletedCount } = await supabase
    .from("todo")
    .delete({ count: "exact" })
    .eq("user_id", user.id)
    .eq("completed", false)
    .lt("deadline", nowUTCforQuery);
  if (delError) console.error("期限切れTodo削除エラー", delError);
  const deleteTodoPenalty = (deletedCount ?? 0) * 5;
  let deleteTodoPenaltyText = "";
  if (deletedCount && deletedCount > 0) {
    deleteTodoPenaltyText = `あと期限切れのTodoが${deletedCount}つあったから消しておいたよ。次は約束守ってね。`;
  }

  const delta = computeDelta(eventType) - deleteTodoPenalty;
  let newAffection = Math.max(0, Math.min(100, profile.affection + delta));

  if (newAffection === 0) {
    await supabase
      .from("profile")
      .update({ affection: newAffection })
      .eq("user_id", user.id);
    redirect("/protected/bad-end");
  }

  const nowDate = new Date();
  const { error } = await supabase
    .from("profile")
    .update({
      affection: newAffection,
      last_seen_at: nowDate,
      last_active: nowDate,
    })
    .eq("user_id", user.id);
  if (error) console.error("プロフィール更新エラー", error);

  // 記念日判定
  const diffDays = today.diff(createdAt.startOf("day"), "day") + 1;
  let annivInfo = null;
  if (diffDays === 7) annivInfo = { type: "week1", value: 1 };
  else if (diffDays === 14) annivInfo = { type: "week2", value: 2 };
  else if (diffDays % 365 === 0)
    annivInfo = { type: "year", value: diffDays / 365 };
  else if (diffDays % 100 === 0)
    annivInfo = { type: "hundredDays", value: diffDays / 100 };
  else {
    const monthDiff = today.diff(createdAt.startOf("day"), "month");
    if (
      monthDiff >= 1 &&
      createdAt.date() === today.date() &&
      monthDiff % 12 !== 0
    )
      annivInfo = { type: "month", value: monthDiff };
  }
  const isAnniversary = annivInfo !== null && eventType !== "same_day";

  // メッセージ組み立て変数
  const mood = getHeraMood(newAffection);
  const baseMessage = buildMessage(mood, eventType);
  let annivText = "";
  let todoActionText = "";

  // ギャップ系アクション
  if (eventType === "one_day_gap") {
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
      todoActionText = `それとなかなかTodoを進めてくれないから君のTodoを「${newTitle}」に書き換えておいたよ。私のためにがんばってくれる？`;
    }
  } else if (eventType === "multi_day_gap") {
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
  }

  // 記念日アクション
  if (isAnniversary) {
    const isPositive =
      eventType === "continuous_active" || eventType === "continuous_inactive";
    if (isPositive) {
      const title =
        ANNIVERSARY_PRESENT_OPTIONS[
        Math.floor(Math.random() * ANNIVERSARY_PRESENT_OPTIONS.length)
        ];
      await supabase.from("todo").insert({
        user_id: user.id,
        title,
        description: "私のためにがんばってくれるよね？",
        deadline: dayjs().add(1, "days").toISOString(),
      });
      annivText =
        annivInfo!.type === "month"
          ? `そういえば今日は${annivInfo!.value}ヶ月の記念日だね。プレゼントを用意したよ。todoを見てみてね♡`
          : annivInfo!.type === "hundredDays"
            ? `そういえば今日は${annivInfo!.value * 100}日記念日だね。プレゼントを用意したよ。todoを見てみてね♡`
            : `そういえば今日は${annivInfo!.value}${annivInfo!.type === "year" ? "年" : "週間"}の記念日だね。プレゼントを用意したよ。todoを見てみてね♡`;
    } else {
      annivText =
        "そういえば今日は記念日だったね…記念日だけ来ればいいと思ってるの？";
    }
  }

  // 最終メッセージ組み立て
  let message = baseMessage;
  if (annivText) message += `\n${annivText}`;
  if (todoActionText) message += `\n${todoActionText}`;
  if (deleteTodoPenaltyText) message += `\n${deleteTodoPenaltyText}`;

  const status: HeraStatus = {
    affection: newAffection,
    mood,
    event: eventType,
    delta,
    message,
  };

  return (
    <>
      <DynamicBackground />
      <div className="z-10 min-w-0 w-full pt-4">
        <HeraProvider status={status}>{children}</HeraProvider>
      </div>
    </>
  );
}
