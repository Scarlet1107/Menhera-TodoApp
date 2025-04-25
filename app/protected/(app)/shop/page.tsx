// app/shop/page.tsx (Server Component)
import React from "react";
import { createClient } from "@/utils/supabase/server";
import Image from "next/image";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import PurchaseAction from "./shopItem";

export const dynamic = "force-dynamic";

// 商品定義
const shopItems = [
  {
    id: "pudding",
    name: "プリン",
    price: 100,
    affectionGain: 10,
    imgSrc: "/shop/pudding.png",
    alt: "プリン",
    isComingSoon: false,
  },
  {
    id: "cake",
    name: "ケーキ",
    price: 200,
    affectionGain: 30,
    imgSrc: "/shop/cake.png",
    alt: "ケーキ",
    isComingSoon: false,
  },
  {
    id: "mic",
    name: "話し方変更",
    price: 99999,
    affectionGain: 0,
    imgSrc: "/shop/mic.png",
    alt: "話し方変更",
    isComingSoon: true,
  },
];

export default async function Page() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const userId = user?.id;

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-center">マイヘラショップ</h1>
      <div className="flex flex-col space-y-4">
        {shopItems.map((item) => (
          <Card key={item.id} className="flex flex-row items-center p-4">
            <div className="flex-shrink-0">
              <Image src={item.imgSrc} alt={item.alt} width={64} height={64} />
            </div>
            <div className="flex-grow ml-4">
              <CardTitle className="text-lg">{item.name}</CardTitle>
              <div className="text-sm mb-1">
                <span className="line-through">{item.price}円</span>{" "}
                <span>無料 (デモ版)</span>
              </div>
              {!item.isComingSoon && (
                <div className="text-xs text-gray-500">
                  好感度 +{item.affectionGain}
                </div>
              )}
              {item.isComingSoon && (
                <div className="text-xs text-pink-500">Coming Soon</div>
              )}
            </div>
            <div className="ml-4">
              <PurchaseAction item={item} userId={userId!} />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
