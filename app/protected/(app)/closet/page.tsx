import { getUserClaims } from "@/utils/supabase/getUserClaims";
import { getUserProfile } from "@/utils/supabase/getUserProfile";
import { createClient } from "@/utils/supabase/server";
import { ClosetClient } from "./ClosetClient";
import { updateAppearance } from "./actions";

type SlotName = "frontHair" | "backHair" | "clothes";

const slotNames: SlotName[] = ["frontHair", "backHair", "clothes"];
const slotDisplayName: Record<SlotName, string> = {
  frontHair: "前髪",
  backHair: "後ろ髪",
  clothes: "洋服",
};

export default async function ClosetPage() {
  const { userId } = await getUserClaims();
  const profile = await getUserProfile(userId);
  const supabase = await createClient();

  const { data: inventoryRows } = await supabase
    .from("user_item")
    .select("item_id")
    .eq("user_id", userId);

  const equippedIds = [
    profile.frontHairItemId,
    profile.backHairItemId,
    profile.clothesItemId,
  ].filter((value): value is string => Boolean(value));

  const itemIds = Array.from(
    new Set([...(inventoryRows?.map((row) => row.item_id) ?? []), ...equippedIds])
  );

  const ownedItemsPromise = itemIds.length
    ? supabase
      .from("item")
      .select(
        "id,name,description,image_filename,preview_image_filename,slot"
      )
      .in("id", itemIds)
    : Promise.resolve({
      data: [] as {
        id: string;
        name: string;
        description: string | null;
        image_filename: string;
        preview_image_filename: string | null;
        slot: string | null;
      }[],
    });

  const [{ data: ownedItemsData }, { data: defaultItems }] = await Promise.all([
    ownedItemsPromise,
    supabase
      .from("item")
      .select("id,name,description,image_filename,preview_image_filename,slot")
      .eq("image_filename", "default")
      .in("slot", slotNames),
  ]);

  const mergedItems = [
    ...(ownedItemsData ?? []),
    ...(defaultItems ?? []),
  ];

  const uniqueItems = new Map<string, {
    id: string;
    name: string;
    description: string | null;
    image_filename: string;
    preview_image_filename: string | null;
    slot: string | null;
  }>();
  mergedItems.forEach((item) => {
    if (item && !uniqueItems.has(item.id)) {
      uniqueItems.set(item.id, item);
    }
  });
  const normalizedItems = Array.from(uniqueItems.values());

  const slots: Record<SlotName, { id: string; name: string; description: string | null; key: string; slot: SlotName }[]> = {
    frontHair: [],
    backHair: [],
    clothes: [],
  };

  const itemsById = new Map<string, { key: string | null; slot: string | null }>();

  normalizedItems.forEach((item) => {
    itemsById.set(item.id, { key: item.image_filename, slot: item.slot });
    if (slotNames.includes(item.slot as SlotName)) {
      const slot = item.slot as SlotName;
      slots[slot].push({
        id: item.id,
        name: item.name,
        description: item.description ?? null,
        key: item.image_filename ?? "default",
        slot,
      });
    }
  });

  slotNames.forEach((slot) => {
    slots[slot].sort((a, b) => a.name.localeCompare(b.name, "ja"));
    const hasDefault = slots[slot].some((item) => item.key === "default");
    if (!hasDefault) {
      slots[slot].unshift({
        id: `default-${slot}`,
        name: `${slotDisplayName[slot]}（デフォルト）`,
        description: "初期スタイル",
        key: "default",
        slot,
      });
    }
  });

  const getKey = (itemId: string | null | undefined) =>
    itemId ? itemsById.get(itemId)?.key ?? "default" : "default";

  const initialSelection = {
    frontHair: profile.frontHairItemId ?? null,
    backHair: profile.backHairItemId ?? null,
    clothes: profile.clothesItemId ?? null,
  } as Record<SlotName, string | null>;

  const initialKeys = {
    frontHairKey: getKey(profile.frontHairItemId),
    backHairKey: getKey(profile.backHairItemId),
    clothesKey: getKey(profile.clothesItemId),
  };

  return (
    <div className="mx-auto mb-24 mt-4 w-full max-w-2xl p-4">
      <ClosetClient
        slots={slots}
        initialSelection={initialSelection}
        initialKeys={initialKeys}
        updateAction={updateAppearance}
      />
    </div>
  );
}
