// lib/hera/decideEvent.ts
import dayjs, { Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import isBetween from "dayjs/plugin/isBetween";
import { EventType } from "./types";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isBetween);

/**
 * イベント種別を判定するヘルパー
 */
export function decideEventType(params: {
  createdAt: Dayjs;
  lastSeenAt: Dayjs | null;
  lastActive: Dayjs | null;
  today: Dayjs;
}): EventType {
  const { createdAt, lastSeenAt, lastActive, today } = params;

  // 初回ログイン
  if (!lastSeenAt || !lastActive) {
    return "first_login";
  }

  const diffDays = today.diff(lastSeenAt.startOf("day"), "day");
  const hadActivityYesterday = lastActive.isBetween(
    today.subtract(1, "day").startOf("day"),
    today.startOf("day"),
    undefined,
    "[)"
  );

  if (lastSeenAt.isSame(today, "day")) {
    return "same_day";
  }

  if (diffDays === 0 || (diffDays === 1 && hadActivityYesterday)) {
    return "continuous_active";
  }
  if (diffDays === 1 && !hadActivityYesterday) {
    return "continuous_inactive";
  }
  if (diffDays === 2) {
    return "one_day_gap";
  }
  if (3 <= diffDays && diffDays <= 4) {
    return "multi_day_gap";
  }
  if (5 <= diffDays && diffDays <= 6) {
    return "long_gap";
  }
  if (7 <= diffDays && diffDays <= 13) {
    return "very_long_gap";
  }
  if (14 <= diffDays && diffDays < 100) {
    return "super_long_gap";
  }
  //   // 100日以上はバッドエンド
  return "over_100_day_gap";
}
