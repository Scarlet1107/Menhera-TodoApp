"use client";
import HeraMessage from "@/components/heraMessage";
import { Button } from "@/components/ui/button";
import { useHera } from "@/lib/hera/context";
import { defaultEasing } from "framer-motion";
import React, { useState } from "react";

const HomePage = () => {
  const { affection, delta, mood, event, message } = useHera();

  return (
    <div className="px-4 w-full">
      <HeraMessage message={message} affection={affection} />

      <div className="p-4">
        <div className="hera-status mt-3 text-sm text-gray-600">
          <span>好感度: {affection}</span>
          <span className="ml-4">ムード: {mood}</span>
          <span className="ml-4">イベント: {event}</span>
          <span className="ml-4">変化量: {delta}</span>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
