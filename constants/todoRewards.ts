import type { AppMode } from "@/constants/mode";

export type TodoDifficultyLevel = "easy" | "normal" | "hard";

export type TodoRewardPhase = "create" | "complete" | "revert" | "delete";

export type TodoRewardValue = {
  affection: number;
  coins: number;
};

export type TodoDifficultyConfig = {
  value: TodoDifficultyLevel;
  label: string;
  description: string;
  rewards: Record<TodoRewardPhase, TodoRewardValue>;
};

const baseRewards: Record<TodoRewardPhase, TodoRewardValue> = {
  create: { affection: 1, coins: 10 },
  complete: { affection: 2, coins: 20 },
  revert: { affection: -5, coins: -20 },
  delete: { affection: -6, coins: -20 },
};

const cloneRewards = (): Record<TodoRewardPhase, TodoRewardValue> => ({
  create: { ...baseRewards.create },
  complete: { ...baseRewards.complete },
  revert: { ...baseRewards.revert },
  delete: { ...baseRewards.delete },
});

export const TODO_DIFFICULTY_CONFIG: Record<
  TodoDifficultyLevel,
  TodoDifficultyConfig
> = {
  easy: {
    value: "easy",
    label: "簡単",
    description: "短時間で終わるタスク向け",
    rewards: cloneRewards(),
  },
  normal: {
    value: "normal",
    label: "普通",
    description: "通常のタスク向け",
    rewards: cloneRewards(),
  },
  hard: {
    value: "hard",
    label: "難しい",
    description: "しっかり腰を据えて取り組むタスク",
    rewards: cloneRewards(),
  },
};

export const TODO_DIFFICULTY_ORDER: TodoDifficultyLevel[] = [
  "easy",
  "normal",
  "hard",
];

export const DEFAULT_TODO_DIFFICULTY: TodoDifficultyLevel = "normal";

export const TODO_DIFFICULTY_OPTIONS = TODO_DIFFICULTY_ORDER.map(
  (value) => TODO_DIFFICULTY_CONFIG[value]
);

export const getTodoReward = (
  difficulty: TodoDifficultyLevel,
  phase: TodoRewardPhase
) => {
  return TODO_DIFFICULTY_CONFIG[difficulty].rewards[phase];
};

export const getModeAdjustedValue = (value: number, mode: AppMode) =>
  mode === "dark" ? value * 2 : value;

export const getAffectionDeltaForMode = (value: number, mode: AppMode) =>
  mode === "dark" && value < 0 ? value * 2 : value;
