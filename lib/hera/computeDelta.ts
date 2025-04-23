// lib/hera/computeDelta.ts
import { EventType } from "./types";

/**
 * EventType に応じて affection の増減 delta を返す
 */
export function computeDelta(event: EventType): number {
  switch (event) {
    case "continuous_active":
      return +1;
    case "continuous_inactive":
      return -1;
    case "one_day_gap":
      return -1;
    case "multi_day_gap":
      return -2;
    case "long_gap":
      return -3;
    case "very_long_gap":
      return -5;
    case "super_long_gap":
      return -10;
    case "over_100_day_gap":
      return -100;
    default: // 初回ログイン or 同日ログイン
      return 0;
  }
}
