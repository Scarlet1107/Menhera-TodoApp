// app/shop/page.tsx (Server Component)
import React from "react";
import Image from "next/image";
import { Card, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/utils/formatPrice";
import { getUserClaims } from "@/utils/supabase/getUserClaims";
import { getUserProfile } from "@/utils/supabase/getUserProfile";
import { createClient } from "@/utils/supabase/server";
import { GachaCard } from "@/components/GachaCard";
import { ShopItemList } from "@/components/ShopItemList";
import type { ShopItem } from "@/components/ShopItemList";
import { drawGacha, purchaseItem } from "./actions";

export const dynamic = "force-dynamic";

export default async function Page() {
  const { userId } = await getUserClaims();
  const profile = await getUserProfile(userId);
  const supabase = await createClient();
  const menheraCoin = profile.menheraCoin;

  const [{ data: itemRows }, { data: ownedRows }] = await Promise.all([
    supabase
      .from("item")
      .select(
        "id,name,description,price,category,slot,is_unique,image_filename,preview_image_filename,affection_gain,gacha_weight,created_at"
      )
      .order("category", { ascending: true })
      .order("price", { ascending: true }),
    supabase
      .from("user_item")
      .select("item_id,quantity")
      .eq("user_id", userId),
  ]);

  const ownedMap = new Map(
    (ownedRows ?? []).map((row) => [row.item_id, row.quantity])
  );

  const shopItems =
    (
      itemRows
        ?.filter(
          (item) =>
            item.price !== null &&
            // コスメはプレビュー付きのみ、消費アイテムはプレビューなしでも表示
            (item.category === "consumable" || item.image_filename !== "default")
        )
        .map((item) => ({
          id: item.id,
          name: item.name,
          imageFilename: item.image_filename,
          previewImageFilename: item.preview_image_filename,
          description: item.description ?? null,
          price: item.price,
          category: item.category,
          slot: item.slot ?? "none",
          isUnique: item.is_unique ?? false,
          ownedQuantity: ownedMap.get(item.id) ?? 0,
          createdAt: new Date(item.created_at),
          affectionGain: item.affection_gain ?? 0,
          gachaWeight: item.gacha_weight ?? 0,
        }))
        .sort((a, b) => {
          const priceA = a.price ?? Number.POSITIVE_INFINITY;
          const priceB = b.price ?? Number.POSITIVE_INFINITY;
          return priceA - priceB;
        }) ?? []
    ) satisfies ShopItem[];

  return (
    <div className="p-4 w-full max-w-2xl mx-auto mb-24 md:mb-0">
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
        <GachaCard drawGachaAction={drawGacha} />
        <ShopItemList
          items={shopItems}
          userBalance={menheraCoin}
          purchaseAction={purchaseItem}
        />
      </div>
    </div>
  );
}
