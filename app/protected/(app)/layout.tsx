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

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isBetween);

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. Supabase の server-side client を作成
  const supabase = await createClient();

  // 2. 認証ユーザー取得
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    console.log("Test1");
    redirect("/sign-in");
  }

  // 3. JST の「今日」を定義
  const today = dayjs().tz("Asia/Tokyo").startOf("day");
  const createdAt = dayjs(user.created_at).tz("Asia/Tokyo");

  // 4. Profile を取得（snake_case → camelCase via alias）
  const { data: profile, error: profileError } = await supabase
    .from("profile")
    .select(
      `affection,
       lastSeenAt:last_seen_at,
       lastActive:last_active`
    )
    .eq("user_id", user.id)
    .single();
  if (profileError) {
    console.log(profileError);
    redirect("/sign-in");
  }

  if (!profile) {
    console.log("profile is null: ", profile);
    redirect("/sign-in");
  }

  // 5. イベント種別 ／ delta 計算
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
  const delta = computeDelta(eventType);
  const newAffection = Math.max(0, Math.min(100, profile.affection + delta));

  // 6. もしnewAffection or profile.affectionが0なら、ユーザーを削除する
  if (newAffection === 0 || profile.affection === 0) {
    redirect("/protected/bad-end");
  }

  // 7. Profile を更新（snake_case）
  const nowDate = new Date();
  await supabase
    .from("profile")
    .update({
      affection: newAffection,
      last_seen_at: nowDate,
      last_active: nowDate,
    })
    .eq("user_id", user.id);

  // 記念日ロジック

  const diffDays = today.diff(createdAt.startOf("day"), "day") + 1;

  type AnnivType = "week1" | "week2" | "month" | "hundredDays" | "year";

  interface AnnivInfo {
    type: AnnivType;
    value: number;
  }

  let annivInfo: AnnivInfo | null = null;

  // 1週間目／2週間目
  if (diffDays === 7) {
    annivInfo = { type: "week1", value: 1 };
  } else if (diffDays === 14) {
    annivInfo = { type: "week2", value: 2 };

    // 1年ごと（365日ごと）
  } else if (diffDays % 365 === 0) {
    annivInfo = { type: "year", value: diffDays / 365 };

    // 100日ごと
  } else if (diffDays % 100 === 0) {
    annivInfo = { type: "hundredDays", value: diffDays / 100 };

    // 毎月（同じ日付）かつ 1ヶ月以上
  } else {
    const monthDiff = today.diff(createdAt.startOf("day"), "month");
    if (
      monthDiff >= 1 &&
      createdAt.date() === today.date() &&
      // 年祝（12ヶ月）は上の year でキャッチ済み
      monthDiff % 12 !== 0
    ) {
      annivInfo = { type: "month", value: monthDiff };
    }
  }

  const isAnniversary = annivInfo !== null;
  // —— 追加終わり ——

  // 8. mood とメッセージ組み立て
  const mood = getHeraMood(newAffection);
  const message = buildMessage(mood, eventType, isAnniversary, createdAt);

  // 9. Context に流し込み
  const status: HeraStatus = {
    affection: newAffection,
    mood,
    event: eventType,
    message,
  };

  return <HeraProvider status={status}>{children}</HeraProvider>;
}
