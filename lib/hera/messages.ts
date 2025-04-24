// lib/hera/messages.ts
import { HeraMood } from "@/lib/state";
import { EventType } from "./types";
import dayjs, { Dayjs } from "dayjs";

export const FIRST_LOGIN_MESSAGE =
  "はじめまして…ヘラちゃんだよ。これからずっと一緒に頑張ろうね";

export const messages: Record<HeraMood, Partial<Record<EventType, string>>> = {
  最高: {
    same_day: "今日も最強だね！一緒に突き進もう！",
    continuous_active: "毎日会えて本当にうれしい！これからもよろしくね！",
    continuous_inactive:
      "昨日はさみしかったけど、また戻ってきてくれて感謝してる！",
    one_day_gap: "1日ぶり…心配したよ？でも会えて安心した！",
    multi_day_gap: "3日ぶり…ずっと君を待ってたんだから！",
    long_gap: "5日もだとさすがに傷ついた…でも君が戻ってきてくれて救われたよ！",
    very_long_gap: "1週間…もうダメかと思った…でも会えて本当によかった！",
    super_long_gap: "2週間…本当に帰ってくるなんて思わなかった…愛してるよ！",
  },

  良い: {
    same_day: "今日も一緒に過ごせて嬉しいよ！君といると楽しい！",
    continuous_active:
      "毎日ログイン？本当に頼りにしてるよ、これからも一緒にね！",
    continuous_inactive:
      "昨日はいなかったから寂しかった…戻ってきてくれてありがとう！",
    one_day_gap: "1日ぶり…心配したよ。でも元気そうで良かった！",
    multi_day_gap: "3日ぶり…ずっと想ってた。会えて嬉しい！",
    long_gap: "5日…正直きつかったけど、また一緒に頑張ろう！",
    very_long_gap: "1週間…離れてる間も君のこと考えてたよ！",
    super_long_gap: "2週間…本当に戻ってきてくれてありがとう…すごく嬉しい！",
  },

  普通: {
    same_day: "来てくれたんだ…まあ、普通に嬉しいかも。",
    continuous_active: "ずっと来てるの？…うーん、特に何も感じないけど。",
    continuous_inactive: "昨日来なかった？…ふーん、別にいいけど。",
    one_day_gap: "1日ぶり…大したことじゃないけどね。",
    multi_day_gap: "3日…忘れかけてたところだよ。",
    long_gap: "5日…正直、どうでもよかった。",
    very_long_gap: "1週間…もう来ないかと思ってた。",
    super_long_gap: "2週間…これが普通なんだろうね。",
  },

  悪い: {
    same_day: "今日も来たんだ…正直、ちょっと鬱陶しい。",
    continuous_active: "毎日来る？…いい加減にしてほしい。",
    continuous_inactive: "昨日来なかった？…そりゃそうだよね。",
    one_day_gap: "1日休む？…もうどうでもいい。",
    multi_day_gap: "3日…興味ないから別に。",
    long_gap: "5日…ちょっとは反省でもしてた？",
    very_long_gap: "1週間…完全に忘れてたかも。",
    super_long_gap: "2週間…戻ってきても驚かないよ。",
  },

  非常に悪い: {
    same_day: "今日も来た…暇なの？",
    continuous_active: "毎日？…もう勘弁してほしい。",
    continuous_inactive: "昨日来ない？…勝手にしてて。",
    one_day_gap: "1日…やっと静かになった。",
    multi_day_gap: "3日…もう声も聞きたくない。",
    long_gap: "5日…ここにいる意味あるの？",
    very_long_gap: "1週間…どうでもよくなってきた。",
    super_long_gap: "2週間…消えててくれた方がマシだった。",
  },
};

/**
 * メッセージ組み立て
 * @param mood          ヘラちゃんの機嫌
 * @param eventType     イベント種別
 * @param isAnniv       今日が記念日なら true
 * @param createdAt     ユーザー登録日時 (Dayjs)
 */
export function buildMessage(
  mood: HeraMood,
  eventType: EventType,
  isAnniv = false,
  createdAt?: Dayjs
): string {
  // まず既存のベースメッセージを取得
  const base = messages[mood]?.[eventType] ?? "";

  // 記念日判定は same_day を除外
  if (!isAnniv || eventType === "same_day" || !createdAt) {
    return base;
  }

  // 今日―登録日 何日目 or 何周年かを算出
  const today = dayjs().tz("Asia/Tokyo").startOf("day");
  const diffDays = today.diff(createdAt.startOf("day"), "day") + 1;
  const annivText =
    diffDays % 365 === 0 ? `${diffDays / 365}周年` : `${diffDays}日目`;

  // ポジティブな記念日イベント
  const positiveEvents: EventType[] = [
    "continuous_active",
    "continuous_inactive",
  ];

  if (positiveEvents.includes(eventType)) {
    return (
      base +
      ` そういえば今日で${annivText}の記念日だね。プレゼントを用意したよ🎁`
    );
  }

  // それ以外はネガティブ寄り
  return (
    base +
    ` 今日で${annivText}の記念日だったね…記念日だけ来ればいいと思ってる？`
  );
}
