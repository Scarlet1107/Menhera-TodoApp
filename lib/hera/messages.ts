// lib/hera/messages.ts
import { HeraMood } from "@/lib/state";
import { EventType } from "./types";

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
    same_day: "今日も来た…暇なの？ウザいんだけど。",
    continuous_active: "毎日？…もう勘弁してほしい。",
    continuous_inactive: "昨日来ない？…勝手にしてて。",
    one_day_gap: "1日…やっと静かになった。",
    multi_day_gap: "3日…もう声も聞きたくない。",
    long_gap: "5日…ここにいる意味あるの？",
    very_long_gap: "1週間…どうでもよくなってきた。",
    super_long_gap: "2週間…消えててくれた方がマシだった。",
  },
};

export function buildMessage(mood: HeraMood, event: EventType): string {
  if (event === "first_login") {
    return FIRST_LOGIN_MESSAGE;
  }
  if (mood in messages) {
    return messages[mood]?.[event] ?? FIRST_LOGIN_MESSAGE;
  }
  return FIRST_LOGIN_MESSAGE;
}
