"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNotification } from "@/lib/context/notification";
import { useProfile } from "@/lib/context/profile";
import type { Notification } from "@/lib/generated/prisma";
import type { DrawGachaResult } from "@/app/protected/(app)/shop/actions";
import { GACHA_COST } from "@/constants/gacha";

type GachaCardProps = {
  drawGachaAction: () => Promise<DrawGachaResult>;
};

type GachaResultSuccess = Extract<DrawGachaResult, { success: true }>;

const categoryLabel: Record<string, string> = {
  cosmetic: "コスメ",
  consumable: "消費アイテム",
};

const slotLabel: Record<string, string> = {
  frontHair: "前髪",
  backHair: "後ろ髪",
  clothes: "服",
  none: "その他",
};

export function GachaCard({ drawGachaAction }: GachaCardProps) {
  const [isDrawing, setIsDrawing] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [stage, setStage] = useState<"confirm" | "play">("confirm");
  const [result, setResult] = useState<GachaResultSuccess | null>(null);
  const [showResult, setShowResult] = useState(false);
  const resultTimerRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();
  const { setNotifications } = useNotification();
  const { profile, setProfile } = useProfile();
  const currentCoins = profile.menheraCoin ?? 0;
  const canAfford = currentCoins >= GACHA_COST;

  useEffect(() => {
    return () => {
      if (resultTimerRef.current) {
        clearTimeout(resultTimerRef.current);
      }
    };
  }, []);

  const resetDialogState = () => {
    if (resultTimerRef.current) {
      clearTimeout(resultTimerRef.current);
      resultTimerRef.current = null;
    }
    setStage("confirm");
    setResult(null);
    setShowResult(false);
    setIsDrawing(false);
  };

  const handleDraw = async () => {
    setIsDrawing(true);
    try {
      const result = await drawGachaAction();
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      if (typeof result.newBalance === "number") {
        setProfile({ menheraCoin: result.newBalance });
      }

      if (result.notification) {
        const notification: Notification = {
          id: result.notification.id,
          userId: result.notification.userId,
          type: result.notification.type,
          content: result.notification.content,
          isRead: result.notification.isRead,
          createdAt: new Date(result.notification.createdAt),
        };
        setNotifications((prev) => [notification, ...prev]);
      }

      setResult(result);
      setStage("play");
      setShowResult(false);

      if (resultTimerRef.current) {
        clearTimeout(resultTimerRef.current);
      }
      resultTimerRef.current = setTimeout(() => {
        setShowResult(true);
      }, 500);

      router.refresh();
    } catch (error) {
      console.error("drawGacha failed", error);
      toast.error("ガチャの実行に失敗しました");
    } finally {
      setIsDrawing(false);
    }
  };

  const handleDialogChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      resetDialogState();
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 space-y-1">
            <CardTitle className="text-xl text-pink-700">メンヘラガチャ</CardTitle>
            <CardDescription>
              {GACHA_COST}メンヘラコインでランダムなアイテムを1つ獲得できます。
            </CardDescription>
            <p className="text-xs text-pink-500">
              既に持っているコスメは抽選対象外になるよ。
            </p>
          </div>
          <Image
            src="/shop/gacha.png"
            alt="ガチャマシン"
            width={96}
            height={96}
            className="drop-shadow-lg"
          />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="text-sm text-pink-700">
            現在のコイン: <span className="font-semibold">{currentCoins}</span> 枚
          </div>
          <AlertDialog open={dialogOpen} onOpenChange={handleDialogChange}>
            <AlertDialogTrigger asChild>
              <Button
                disabled={!canAfford || isDrawing}
                className="bg-pink-500 text-white hover:bg-pink-600 disabled:bg-gray-200 disabled:text-gray-500"
              >
                {canAfford ? "ガチャを回す" : "コイン不足"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <div className="min-h-[260px] overflow-hidden">
                <AnimatePresence mode="wait">
                  {stage === "confirm" && (
                    <motion.div
                      key="confirm"
                      initial={{ opacity: 1, x: 0 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -30 }}
                      transition={{ duration: 0.25 }}
                      className="space-y-4 h-full flex flex-col justify-between py-2"
                    >
                      <AlertDialogHeader>
                        <AlertDialogTitle>ガチャを引きますか？</AlertDialogTitle>
                        <AlertDialogDescription className="space-y-1">
                          <span>{GACHA_COST}メンヘラコインを消費してガチャを引きます。</span>
                          <br />
                          <span className="text-muted-foreground">
                            消費したコインは返却されません。
                          </span>
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter className="flex w-full flex-col items-center gap-3 sm:flex-row sm:justify-center">                        <AlertDialogCancel disabled={isDrawing}>キャンセル</AlertDialogCancel>
                        <Button
                          type="button"
                          onClick={handleDraw}
                          disabled={isDrawing}
                          className="bg-pink-500 text-white hover:bg-pink-600"
                        >
                          {isDrawing ? "抽選中..." : `${GACHA_COST}ヘラコインで引く`}
                        </Button>
                      </AlertDialogFooter>
                    </motion.div>
                  )}

                  {stage === "play" && (
                    <motion.div
                      key="play"
                      initial={{ opacity: 0, x: 40 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -30 }}
                      transition={{ duration: 0.35 }}
                      className="flex flex-col items-center gap-5 py-2"
                    >
                      <VisuallyHidden>
                        <AlertDialogTitle>ガチャ結果</AlertDialogTitle>
                      </VisuallyHidden>
                      <div className="flex items-center justify-center gap-4">
                        <motion.div
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.35 }}
                          className="rounded-xl bg-pink-50 p-3 shadow-inner"
                        >
                          <Image
                            src="/shop/gacha.png"
                            alt="ガチャマシン"
                            width={90}
                            height={90}
                            className="drop-shadow"
                          />
                        </motion.div>
                        <motion.div
                          initial={{ opacity: 0, x: 30 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.4 }}
                          className="rounded-xl bg-pink-100 p-3 shadow-inner"
                        >
                          <Image
                            src="/shop/gacha-4_8.gif"
                            alt="ガチャ演出"
                            width={140}
                            height={140}
                            className="drop-shadow"
                          />
                        </motion.div>
                      </div>

                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: showResult ? 1 : 0, y: showResult ? 0 : 10 }}
                        transition={{ duration: 0.35 }}
                        className="text-center space-y-3"
                      >
                        {result && showResult && (
                          <>
                            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                              <Badge variant="secondary">
                                {categoryLabel[result.item.category] ?? "アイテム"}
                              </Badge>
                              {result.item.category === "cosmetic" && "slot" in result.item && (
                                <Badge variant="outline">
                                  {slotLabel[result.item.slot as string] ?? "その他"}
                                </Badge>
                              )}
                            </div>
                            <div className="text-lg font-bold text-pink-700">
                              「{result.item.name}」を手に入れました！
                            </div>
                            <Button
                              onClick={() => handleDialogChange(false)}
                              className="bg-pink-500 text-white hover:bg-pink-600"
                            >
                              閉じる
                            </Button>
                          </>
                        )}
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}
