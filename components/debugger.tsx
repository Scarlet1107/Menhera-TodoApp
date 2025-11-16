"use client";
import { useHera } from "@/lib/context/hera";
import React from "react";
// Display Heras status and debug information
const Debugger = () => {
  const { affection, delta, mood, event, message } = useHera();

  return (
    <div className="hera-status mt-3 text-sm text-black bg-white z-50">
      <p>好感度: {affection}</p>
      <p>ムード: {mood}</p>
      <p className="ml-4">イベント: {event}</p>
      <p className="ml-4">変化量 (delta): {delta}</p>
      {/* <p className="ml-4">メッセージ: {message}</p> */}
    </div>
  );
};

export default Debugger;
