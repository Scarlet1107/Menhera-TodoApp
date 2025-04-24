// utils/date.ts
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * JST に変換した上で任意フォーマットの文字列を返す
 * @param input "YYYY-MM-DD" 形式文字列または Date オブジェクト
 * @param fmt 出力フォーマット (デフォルト "YYYY-MM-DD")
 * @returns フォーマット済み日付文字列 (JST)
 */
export function toJstDateString(
  input: string | Date,
  fmt = "YYYY-MM-DD"
): string {
  // 常に UTC として解釈してから JST に変換
  const utcObj =
    typeof input === "string"
      ? dayjs.utc(input, "YYYY-MM-DD")
      : dayjs.utc(input.toISOString());
  const jst = utcObj.tz("Asia/Tokyo");
  return jst.format(fmt);
}

/**
 * ユーザー選択の "YYYY-MM-DD" 文字列を
 * 日本時間の終日 (23:59:59) として UTC ISO 文字列に変換
 * @param dateString "YYYY-MM-DD"
 * @returns UTC ISO 文字列
 */
export function jstDateStringToUtcIso(dateString: string): string {
  return dayjs
    .tz(dateString, "YYYY-MM-DD", "Asia/Tokyo") // 00:00 JST でパース
    .endOf("day") // 23:59:59 JST
    .utc() // UTC に変換
    .toISOString(); // ISO 文字列
}
