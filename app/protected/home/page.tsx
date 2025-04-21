"use client";
import HeraMessage from "@/components/heraMessage";
import { Button } from "@/components/ui/button";
import React, { useState } from "react";

const HomePage = () => {
  const [test, setTest] = useState(
    "どうして...昨日は楽しかったのに...今日はどうしてこんなに辛いの...？"
  );
  return (
    <div className="px-4 w-full">
      <h1>ここでヘラちゃんを表示するのだ</h1>
      <Button onClick={() => setTest("テストメッセージ")}>テスト</Button>
      <HeraMessage message={test} affection={12} />
    </div>
  );
};

export default HomePage;
