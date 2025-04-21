// 型定義
export type HeraMood = "最高" | "普通" | "悪い" | "非常に悪い";

export interface HeraState {
  affection: number;
  mood: HeraMood;
}

// 感情変換ロジック
export const getHeraMood = (affection: number): HeraMood => {
  if (affection >= 85) return "最高";
  if (affection >= 60) return "普通";
  if (affection >= 35) return "悪い";
  return "非常に悪い";
};
