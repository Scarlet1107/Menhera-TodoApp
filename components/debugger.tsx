"use client";
import { useHera } from "@/lib/hera/context";
import React from "react";
// Display Heras status and debug information
const Debugger = () => {
  const { affection, delta, mood, event, message } = useHera();

  return (
    <div className="hera-status mt-3 text-sm text-gray-600">
      <span>好感度: {affection}</span>
      <span>ムード: {mood}</span>
      <span className="ml-4">イベント: {event}</span>
      <span className="ml-4">変化量 (delta): {delta}</span>
      <span className="ml-4">メッセージ: {message}</span>
    </div>
  );
};

export default Debugger;
