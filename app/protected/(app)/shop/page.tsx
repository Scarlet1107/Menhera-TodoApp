// app/shop/page.tsx (Server Component)
import React from "react";
import Image from "next/image";
import { Card, CardTitle } from "@/components/ui/card";
import PurchaseDialog from "@/components/PurchaseDialog";
import { formatPrice } from "@/utils/formatPrice";
import { getUserClaims } from "@/utils/supabase/getUserClaims";
import { getUserProfile } from "@/utils/supabase/getUserProfile";

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
  const profile = await getUserProfile(userId);
  const menheraCoin = profile.menheraCoin;

  return (
    <div className="p-4 max-w-md mx-auto mb-24 md:mb-0">
      <div className="flex flex-col space-y-4">
        <Card className="p-4 mb-4">
          <div className="flex items-center">
            <div className="flex items-center space-x-3">
              <CardTitle className="text-lg">所持メンヘラコイン：</CardTitle>
            </div>
            <div className="text-xl font-bold flex justify-center items-center space-x-2">
              {formatPrice(menheraCoin)}
              <Image
                src="/shop/hera-coin.png"
                alt="メンヘラコイン"
                width={28}
                height={28}
              />
            </div>
          </div>
        </Card>
        {shopItems.map((item) => (
          <Card key={item.id} className="flex flex-row justify-between p-4">
            <div className="flex space-x-2">
              <div className="shrink-0">
                <Image src={item.imgSrc} alt={item.alt} width={64} height={64} />
              </div>
              <div className="grow ml-4">
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
            </div>
            <div className="items-center align-middle flex justify-center">
              <PurchaseDialog item={item} userId={userId} />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
