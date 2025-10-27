// app/shop/page.tsx (Server Component)
import React from "react";
import Image from "next/image";
import { Card, CardTitle } from "@/components/ui/card";
import PurchaseDialog from "@/components/PurchaseDialog";
import { formatPrice } from "@/utils/formatPrice";
import { getUserClaims } from "@/utils/supabase/getUserClaims";

export const dynamic = "force-dynamic";

// 商品定義
const shopItems = [
  {
    id: "pudding",
    name: "プリン",
    price: 99999,
    affectionGain: 10,
    imgSrc: "/shop/pudding.png",
    alt: "プリン",
    isComingSoon: true,
  },
  {
    id: "cake",
    name: "ケーキ",
    price: 99999,
    affectionGain: 30,
    imgSrc: "/shop/cake.png",
    alt: "ケーキ",
    isComingSoon: true,
  },
  {
    id: "chikawa",
    name: "おくすり？",
    price: 99999,
    affectionGain: 0,
    imgSrc: "/shop/medicine.png",
    contentSrc: "/chikawa/mosaic-eyes.png",
    alt: "おくすり?",
    isComingSoon: true,
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
  {
    id: "maid",
    name: "着せ替え",
    price: 99999,
    affectionGain: 0,
    imgSrc: "/shop/maid.png",
    alt: "着せ替え",
    isComingSoon: true,
  },
];

export default async function Page() {
  const { userId } = await getUserClaims();

  return (
    <div className="p-4 max-w-md mx-auto mb-24 md:mb-0">
      <div className="flex flex-col space-y-4">
        {shopItems.map((item) => (
          <Card key={item.id} className="flex flex-row items-center p-4">
            <div className="flex-shrink-0">
              <Image src={item.imgSrc} alt={item.alt} width={64} height={64} />
            </div>
            <div className="flex-grow ml-4">
              <CardTitle className="text-lg">{item.name}</CardTitle>
              <div className="text-sm mb-1">
                <span className="line-through">{formatPrice(item.price)}</span>
                <br />
                {/* <span>→ 無料 (デモ版)</span> */}
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
              <PurchaseDialog item={item} userId={userId} />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
