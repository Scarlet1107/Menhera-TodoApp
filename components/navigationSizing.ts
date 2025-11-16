import type { CSSProperties } from "react";

export type SizeValue = number | string;

export interface SizeConfig {
  width?: SizeValue;
  height?: SizeValue;
}

const toStyleValue = (value?: SizeValue) =>
  typeof value === "number" ? `${value}px` : value;

export const buildSizeStyle = (
  config?: SizeConfig
): CSSProperties | undefined => {
  if (!config) return undefined;

  const { width, height } = config;
  return {
    width: toStyleValue(width),
    height: toStyleValue(height),
  };
};

export const buildWidthStyle = (
  value?: SizeValue
): CSSProperties | undefined =>
  value ? { width: toStyleValue(value) } : undefined;
