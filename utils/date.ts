// utils/date.ts
import { toZonedTime, format } from "date-fns-tz";

export const formatToJST = (date: Date | string, fmt = "yyyy/MM/dd HH:mm") => {
  const zoned = toZonedTime(date, "Asia/Tokyo");
  return format(zoned, fmt, { timeZone: "Asia/Tokyo" });
};
