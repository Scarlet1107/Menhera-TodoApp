// presentMessage.ts
import { getHeraMood, type HeraMood } from "@/lib/state";

type PresentMessageArgs = {
  affectionAfter: number;
  itemName: string;  // "プリン" | "ケーキ" ほか
  quantity: number;  // 互換のため保持（未使用）
  affectionGain: number;
};

const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

// 数量は無視し、助詞も付けない素の名詞だけを返す
const gift = (itemName?: string) => itemName?.trim() ?? "";
const noun = (itemName?: string) => itemName ?? "";

type Maker = (args: PresentMessageArgs) => string;

const presentPools: Record<HeraMood, Maker[]> = {
  // 参考文体に合わせた“明るいけど砕けすぎない”トーン
  最高: [
    ({ itemName }) =>
      `${gift(itemName)}、本当にうれしい！今日も一緒にがんばろう！`,
    () =>
      `うれしい…ずっとそばにいてくれるって思える`,
    ({ itemName }) =>
      `${gift(itemName)}ありがとう。君といると安心する`,
  ],

  良い: [
    () =>
      `来てくれてうれしい。気にかけてくれてありがとう`,
    ({ itemName }) =>
      `${gift(itemName)}ありがとう。気持ちが明るくなったよ`,
    () =>
      `今日も一緒に過ごせてうれしい。これからもよろしくね`,
  ],

  // “軽ヘラ”トーン：喜び＋不安を薄く同居
  普通: [
    () =>
      `…ありがとう。少しだけ気持ちが落ち着いた気がする`,
    ({ itemName }) =>
      `${gift(itemName)}…うれしいけど、なんか複雑…`,
    () =>
      `こういうの、もらえると寂しい気持ち少しだけ和らぐよ`,
  ],

  // 怒り・疑い・ごまかし指摘
  悪い: [
    ({ itemName }) => {
      const g = gift(itemName);
      return g
        ? `${g}で機嫌取れるって思ってない？そんなに単純じゃないから`
        : `こういうのだけで機嫌取ろうとするの、やめて？`;
    },
    () =>
      `ねぇ、都合が悪いときだけ優しくして誤魔化すのは違うよね`,
    ({ itemName }) => {
      const n = noun(itemName);
      if (n === "プリン") return `またプリン？甘くすれば黙るって思ってるの？`;
      if (n === "ケーキ") return `ケーキでご機嫌取りは安すぎるよ。私はそんなに軽くない`;
      return `そうやって物で黙らせようとするの、見え見えだよ`;
    },
  ],

  // さらに強い怒り・疑い（浮気・余り・軽視）
  非常に悪い: [
    ({ itemName }) => {
      const head = gift(itemName);
      const pre = head ? `${head}持ってきて、` : "";
      return `${pre}浮気でもしてた？それで全部なかったことにできると思ってるの？`;
    },
    ({ itemName }) => {
      const g = gift(itemName) || "それ";
      return `${g}、ほかの子に配った余りじゃないよね`;
    },
    () =>
      `私のこと軽く見てるよね。物で解決できるって本気で思ってる？`,
  ],
};

// 安全フォールバック（配列なし/空配列を想定）
const fallback: Maker = () => `ありがとう`;

export function getPresentMessage(args: PresentMessageArgs): string {
  const mood = getHeraMood(args.affectionAfter);
  const pool = presentPools[mood];
  const maker = pool && pool.length > 0 ? pick(pool) : fallback;
  return maker(args);
}
