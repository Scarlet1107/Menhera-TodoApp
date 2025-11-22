import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { getUserClaims } from "@/utils/supabase/getUserClaims";
import { getUserProfile } from "@/utils/supabase/getUserProfile";
import { updateAppearance } from "../closet/actions";
import { ItemsClient, type ConsumableItem } from "./ItemsClient";
import { consumeItem } from "./actions";

export const dynamic = "force-dynamic";

type SlotName = "frontHair" | "backHair" | "clothes";

type ClosetItem = {
  id: string;
  name: string;
  description: string | null;
  key: string;
  slot: SlotName;
};

const slotNames: SlotName[] = ["frontHair", "backHair", "clothes"];
const defaultOption = {
  id: "default",
  name: "デフォルト",
  description: "初期スタイル",
  key: "default",
};

const buildClosetData = async (
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  profile: Awaited<ReturnType<typeof getUserProfile>>
) => {
  const { data: inventoryRows, error: inventoryError } = await supabase
    .from("user_item")
    .select("item_id")
    .eq("user_id", userId);
  if (inventoryError) {
    console.error("[Items] failed to load inventory ids", inventoryError);
  }

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
      error: null,
    });

  const [{ data: ownedItemsData, error: ownedError }, { data: defaultItems, error: defaultError }] =
    await Promise.all([
      ownedItemsPromise,
      supabase
        .from("item")
        .select("id,name,description,image_filename,preview_image_filename,slot")
        .eq("image_filename", "default")
        .in("slot", slotNames),
    ]);

  if (ownedError) console.error("[Items] failed to load owned items", ownedError);
  if (defaultError) console.error("[Items] failed to load default items", defaultError);

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

  const slots: Record<SlotName, ClosetItem[]> = {
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
        ...defaultOption,
        id: `default-${slot}`,
        name: `${slot === "frontHair" ? "前髪" : slot === "backHair" ? "後ろ髪" : "洋服"}（デフォルト）`,
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

  return { slots, initialSelection, initialKeys };
};

const fetchConsumables = async (
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
): Promise<ConsumableItem[]> => {
  const { data, error } = await supabase
    .from("user_item")
    .select(
      "id,quantity,item_id,item:item_id!inner(id,name,description,preview_image_filename,affection_gain,category)"
    )
    .eq("user_id", userId)
    .eq("item.category", "consumable")
    .gt("quantity", 0)
    .order("acquired_at", { ascending: false });

  if (error) {
    console.error("[Items] failed to load consumables", error);
    return [];
  }

  type ConsumableRow = {
    quantity: number;
    item: {
      id: string;
      name: string;
      description: string | null;
      preview_image_filename: string | null;
      affection_gain: number | null;
      category: string;
    } | null;
  };

  const rows = data as unknown as ConsumableRow[];

  return (rows ?? [])
    .filter((row) => row.item && row.item.category === "consumable")
    .map((row) => ({
      itemId: row.item!.id,
      name: row.item!.name,
      description: null,
      affectionGain: row.item!.affection_gain ?? 0,
      quantity: row.quantity ?? 0,
      previewImageFilename: row.item!.preview_image_filename ?? null,
    }))
    .filter((item) => item.quantity > 0);
};

export default async function ItemsPage() {
  const { userId } = await getUserClaims();
  const profile = await getUserProfile(userId);
  const supabase = await createClient();

  const [closetData, consumables] = await Promise.all([
    buildClosetData(supabase, userId, profile),
    fetchConsumables(supabase, userId),
  ]);

  const itemTabCookie = (await cookies()).get("itemTab")?.value;
  const initialTab = itemTabCookie === "consumable" ? "consumable" : "closet";

  if (!profile) {
    redirect("/protected/home");
  }

  return (
    <div className="mx-auto mb-24 mt-4 w-full max-w-2xl p-4">
      <ItemsClient
        closetProps={{ ...closetData, updateAction: updateAppearance }}
        consumables={consumables}
        consumeAction={consumeItem}
        initialTab={initialTab}
      />
    </div>
  );
}
