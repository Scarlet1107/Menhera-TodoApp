import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function Home() {
  return (
    <main className="w-screen flex flex-col items-center justify-center min-h-screen p-6 bg-pink-50 dark:bg-stone-800 transition-colors">
      <div className="relative w-64 h-64 md:w-96 md:h-96 mb-6 -mt-24">
        <Image
          src="/hera-chan/welcome/good.png"
          alt="ウェルカムヘラちゃん"
          fill
          className="object-contain"
        />
      </div>

      <h1 className="text-4xl md:text-5xl font-bold text-pink-600 dark:text-pink-300 mb-4">
        また…会えたね
      </h1>

      <p className="text-center text-gray-700 dark:text-gray-300 mb-8 text-base md:text-lg">
        メンヘラTODOへようこそ！
        <br />
        最初の一歩を踏み出して、私と一緒にがんばろう？
      </p>

      <div className="flex space-x-4">
        <Button asChild variant="outline">
          <Link href="/sign-in">ログイン</Link>
        </Button>
        <Button asChild variant="default">
          <Link href="/sign-up">新規登録</Link>
        </Button>
      </div>
    </main>
  );
}
