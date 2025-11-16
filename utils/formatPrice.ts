// utils/formatPrice.ts

/**
 * 数値を日本円表記の文字列にフォーマットします。
 * 例: 1000 -> "1,000円"
 * @param amount - 金額（数値）
 * @returns フォーマット済み金額文字列
 */
export function formatPrice(amount: number): string {
  // toLocaleString で3桁区切りにし、末尾に "円" を付与
  return `${amount.toLocaleString("ja-JP")}`;
}
