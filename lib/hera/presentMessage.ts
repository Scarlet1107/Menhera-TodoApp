import { getHeraMood, type HeraMood } from "@/lib/state";

type PresentMessageArgs = {
  affectionAfter: number;
  itemName: string;
  quantity: number;
  affectionGain: number;
};

const buildQuantityText = (itemName: string, quantity: number) => {
  if (quantity <= 1) return itemName;
  return `${itemName}を${quantity}個`;
};

const presentMessages: Record<
  HeraMood,
  (args: PresentMessageArgs) => string
> = {
  最高: ({ itemName, quantity }) =>
    `${buildQuantityText(itemName, quantity)}もくれるの？大好き！`,
  良い: ({ itemName, quantity }) =>
    `${buildQuantityText(itemName, quantity)}ありがとう！しあわせが増えたよ。`,
  普通: ({ itemName, quantity }) =>
    `${buildQuantityText(itemName, quantity)}くれたんだ…！少しだけ気分が上がったかも。`,
  悪い: ({ itemName, quantity }) =>
    `${buildQuantityText(itemName, quantity)}くれたんだね。ちょっとだけ機嫌直ったかも…。`,
  非常に悪い: ({ itemName, quantity }) =>
    `${buildQuantityText(itemName, quantity)}…本当に私のこと考えてくれてる？でも癒やされたよ。`,
};

export function getPresentMessage(args: PresentMessageArgs): string {
  const { affectionAfter } = args;
  const mood = getHeraMood(affectionAfter);
  return presentMessages[mood](args);
}
