type RelativeTimeInput = string | Date | null | undefined;

export const formatRelativeTime = (value: RelativeTimeInput) => {
  if (!value) return "";

  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";

  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));

  // 24時間以内の場合は相対時間表記
  if (diffInMs < 24 * 60 * 60 * 1000) {
    if (diffInMinutes < 1) {
      return "たった今";
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}分前`;
    } else {
      return `${diffInHours}時間前`;
    }
  }

  // 24時間を超える場合は日時表記
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: false,
  }).format(date);
};
