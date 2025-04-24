// lib/hera/types.ts
import { HeraMood } from "@/lib/state";

/**
 * ログイン状態のイベント種別
 */
export type EventType =
  | "same_day" // 同日ログイン
  | "first_login" // 初回ログイン
  | "continuous_active" // 連続ログイン（かつ昨日アクティブ）
  | "continuous_inactive" // 連続ログイン（でも昨日非アクティブ）
  | "one_day_gap" // 1日だけ空けた
  | "multi_day_gap" // 3～4日空けた
  | "long_gap" // 5～6日空けた
  | "very_long_gap" // 7～13日空けた
  | "super_long_gap" // 14～99日空けた
  | "over_100_day_gap"; // 100日以上空けた

export type { HeraMood };

// 型定義
export type Todo = {
  id: string;
  title: string;
  description?: string;
  deadline: string;
  completed: boolean;
};
