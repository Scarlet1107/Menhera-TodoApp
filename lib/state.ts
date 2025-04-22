// 型定義
export type HeraMood =
  | "最高"
  | "良い"
  | "普通"
  | "悪い"
  | "非常に悪い"
  | "バッドエンド";

export interface HeraState {
  affection: number;
  mood: HeraMood;
}

// 感情変換ロジック
export const getHeraMood = (affection: number): HeraMood => {
  if (affection == 100) return "最高";
  if (affection >= 90) return "良い";
  if (affection >= 60) return "普通";
  if (affection >= 35) return "悪い";
  if (affection > 0) return "非常に悪い";
  if (affection == 0) "バッドエンド";
  return "普通";
};
