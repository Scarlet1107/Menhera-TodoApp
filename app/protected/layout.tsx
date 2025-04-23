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
  if (profileError || !profile) {
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

  // 6. Profile を更新（snake_case）
  const nowDate = new Date();
  await supabase
    .from("profile")
    .update({
      affection: newAffection,
      last_seen_at: nowDate,
      last_active: nowDate,
    })
    .eq("user_id", user.id);

  // 7. mood とメッセージ組み立て
  const mood = getHeraMood(newAffection);
  const message = buildMessage(mood, eventType);

  // 8. Context に流し込み
  const status: HeraStatus = {
    affection: newAffection,
    mood,
    event: eventType,
    message,
  };

  return <HeraProvider status={status}>{children}</HeraProvider>;
}
