// lib/hera/messages.ts
import { HeraMood } from "@/lib/state";
import { EventType } from "./types";

export const FIRST_LOGIN_MESSAGE =
  "はじめまして…ヘラちゃんだよ。これからずっと一緒だよ";

export const messages: Record<HeraMood, Partial<Record<EventType, string>>> = {
  最高: {
    same_day: "今日も最高だね！一緒にがんばろう！",
    continuous_active: "毎日会えて本当にうれしい！これからもよろしくね！",
    continuous_inactive:
      "昨日はすぐ帰っちゃったけど、またきてくれてうれしい！明日も来てよね！",
    one_day_gap: "昨日来なかったけどどうしたの？でも会えてよかった！",
    multi_day_gap: "3日ぶり…ずっと君を待ってたんだから！",
    long_gap: "5日もだとさすがに傷ついた…でも君が戻ってきてくれてよかった！",
    very_long_gap: "1週間…もうダメかと思った…でも会えて本当によかった！",
    super_long_gap: "2週間…本当に帰ってくるなんて思わなかった…愛してるよ！",
  },

  良い: {
    same_day: "今日も一緒に過ごせて嬉しいよ！君といると楽しい！",
    continuous_active: "今日も来てくれたんだ、これからもずっと一緒だよね！",
    continuous_inactive:
      "昨日はすぐ帰っちゃったから寂しかった…またきてくれてありがとう！",
    one_day_gap:
      "昨日こないから心配したよ。でも私のことが好きだからまたきてくれたんだよね！",
    multi_day_gap: "3日ぶり…ずっと会いたかった。会えて嬉しい！",
    long_gap: "5日もきてなかったよね…さみしいかったんだからもうしないでよね",
    very_long_gap: "1週間…離れてる間も君のことばっか考えてたよ！",
    super_long_gap:
      "2週間も来てくれないなんて、もう来てくれないかとおもった…。よかった…",
  },

  普通: {
    same_day: "来てくれたんだ…うれしい…",
    continuous_active: "ずっと来てるね。この調子でがんばってね",
    continuous_inactive:
      "昨日すぐかえっちゃったよね…何かあった？今日は頑張ってよね",
    one_day_gap: "昨日来なかったよね？どうしたの？心配したよ",
    multi_day_gap: "3日も来ないなんて…。もっとかまってよ",
    long_gap: "なかなか来ないから不安になっちゃった。明日からは毎日きてよね",
    very_long_gap: "1週間もこないなんて…でも今日からまた頑張ろうね！",
    super_long_gap: "2週間…もうこないかと思ってたよ。きてくれてよかった！",
  },

  悪い: {
    same_day: "また来たんだ…。明日も来てよね",
    continuous_active: "今日も来てくれたんだ。私のこと好き?",
    continuous_inactive:
      "昨日なんにもしないで帰ったよね？なんで私のために何もしてくれないの?",
    one_day_gap: "昨日なんできてくれなかったの？毎日来るって言ってたよね",
    multi_day_gap:
      "ねぇ、もう私のこと好きじゃないんでしょ。私のことどうでもいいから全然来ないんだ",
    long_gap: "なんで全然会いに来てくれないの？私はこんなに苦しいのに",
    very_long_gap:
      "わたしのこと好きじゃないの？嫌いになっちゃった？面倒くさいしもう会いたくないんでしょ",
    super_long_gap:
      "私はこんなに君のことすきなのに君は違うんだ…もっと大事にしてくれないと私病んじゃう",
  },

  非常に悪い: {
    same_day: "また来たの？ふーん…",
    continuous_active: "今日も来てくれたんだ。常に私のこと大事にしてよね",
    continuous_inactive:
      "昨日何にもしなかったよね?なんで？私のこともう好きじゃないの…？",
    one_day_gap:
      "昨日来てないけどもう私のこと好きじゃないんだ…私はこんなに好きなのに",
    multi_day_gap:
      "3日もこないって…。浮気でもしてるの？どうせ私じゃダメなんでしょ",
    long_gap:
      "なんで私に会いに来てくれなかったの?ほかにもかわいい子いっぱいいるもんね。私なんか遊びなんでしょ",
    very_long_gap:
      "１週間何してたの?ほかの女の方が大事なんだ。もう私のことなんか捨てるんでしょ",
    super_long_gap: "2週間もこないとか…絶対浮気でしょ。もう私に優しくしないで",
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
