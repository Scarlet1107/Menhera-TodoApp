import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import FadeInSection from "@/components/fadeInSection";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"


export default async function Home() {
  return (
    <div className="w-screen px-8 bg-pink-50 dark:bg-stone-800 transition-colors">
      <div className="max-w-2xl flex flex-col items-center justify-center min-h-screen mx-auto">
        <section className="flex flex-col items-center h-screen">
          <FadeInSection className="relative w-64 h-64 md:w-96 md:h-96 mb-6">
            <Image
              src="/hera-chan/welcome/good.png"
              alt="ウェルカムヘラちゃん"
              fill
              className="object-contain"
            />
          </FadeInSection>
          <FadeInSection className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-pink-600 dark:text-pink-300 mb-4">
              また…会えたね
            </h1>
            <p className="text-center text-gray-700 dark:text-gray-300 mb-8 text-base md:text-lg">
              メンヘラTODOへようこそ！
              <br />
              最初の一歩を踏み出して、私と一緒にがんばろう？
            </p>
          </FadeInSection>
          <FadeInSection>
            <div className="flex space-x-4">
              <Button asChild variant="outline">
                <Link href="/sign-in">ログイン</Link>
              </Button>
              <Button asChild variant="default">
                <Link href="/sign-up">新規登録</Link>
              </Button>
            </div>
          </FadeInSection>
        </section>
        <section className="flex flex-col items-center min-h-screen max-h-full space-y-12">
          <FadeInSection className="w-full">
            <Card>
              <CardHeader className="text-2xl font-semibold text-pink-600 dark:text-pink-300 mb-4 flex space-x-2 items-center">
                <Image src={"/heart.png"} width={25} height={25} alt="♡" />
                <span>どんなアプリ？</span>
              </CardHeader>
              <CardContent className="text-gray-700 dark:text-gray-300 leading-relaxed">
                やることリストを管理できるアプリです。
                通常のTodoアプリではなかなか続かないあなたも、ヘラちゃんと一緒なら続けられるかも？
              </CardContent>
            </Card>
          </FadeInSection>
          <FadeInSection className="w-full" >
            <Card>
              <CardHeader className="text-2xl font-semibold text-pink-600 dark:text-pink-300 mb-4 flex space-x-2 items-center">
                <Image src={"/hera-chan/icon/excellent.png"} width={50} height={50} alt="アイコン" className="rounded-full" />
                <span className="block sm:hidden">メンヘラTodo?</span>
                <span className="hidden sm:block">メンヘラTodoって何?</span>
              </CardHeader>
              <CardContent className="text-gray-700 dark:text-gray-300 leading-relaxed text-center">
                <h3>メンタルがちょっと不安定な「ヘラちゃん」と一緒にTodoを管理をがんばろう！</h3>
                <br />
                <ul className="list-disc list-outside space-y-3 marker:text-pink-600 marker:text-lg ml-8 text-start text-sm sm:text-base">
                  <li>Todoの達成で変わる<span className="underline decoration-pink-500 text-pink-500">好感度システム</span></li>
                  <li>ログイン状況によって<span className="underline decoration-pink-500 text-pink-500">表情やテキストが変化</span></li>
                  <li>ログインボーナスで<span className="underline decoration-pink-500 text-pink-500">好感度アップ</span></li>
                </ul>
              </CardContent>
            </Card>
          </FadeInSection>
          <FadeInSection className="w-full">
            <Card>
              <CardHeader className="text-2xl font-semibold text-pink-600 dark:text-pink-300 mb-4 flex space-x-2 items-center">
                <Image src={"/hera-chan/icon/very-bad.png"} width={50} height={50} alt="アイコン" className="rounded-full" />
                <span>もしもサボると...?</span>
              </CardHeader>
              <CardContent className="text-gray-700 dark:text-gray-300 leading-relaxed">
                <ul className="list-disc list-outside space-y-3 marker:text-red-600 marker:text-lg ml-8 text-start text-sm sm:text-base">
                  <li>ヘラちゃんが<span className="underline decoration-red-600 text-red-700">勝手にTodoを編集...</span></li>
                  <li>期限切れのTodoは<span className="underline decoration-red-600 text-red-700">勝手に消去</span></li>
                  <li>好感度0で<span className="underline decoration-red-600 text-red-700">バッドエンドに...?</span></li>
                </ul>
              </CardContent>
            </Card>
          </FadeInSection>



        </section>
        <section className="flex flex-col items-center h-screen justify-center">
          <FadeInSection className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-pink-600 dark:text-pink-300 mb-4">
              ヘラちゃんと一緒にTodoをがんばろう！
            </h1>

            <FadeInSection className="relative w-64 h-64 md:w-96 md:h-96 mb-6 mx-auto">
              <Image
                src="/hera-chan/welcome/good.png"
                alt="ウェルカムヘラちゃん"
                fill
                className="object-contain"
              />
            </FadeInSection>
            <div className="flex space-x-4 justify-center">
              <Button asChild variant="outline">
                <Link href="/sign-in">ログイン</Link>
              </Button>
              <Button asChild variant="default">
                <Link href="/sign-up">新規登録</Link>
              </Button>
            </div>
          </FadeInSection>
        </section>
      </div >
    </div>
  );
}
