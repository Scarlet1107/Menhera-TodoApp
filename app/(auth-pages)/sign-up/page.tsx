import { signUpAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default async function Signup(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;
  if ("message" in searchParams) {
    return (
      <div className="w-full flex-1 flex items-center h-screen sm:max-w-md justify-center gap-2 p-4">
        <FormMessage message={searchParams} />
      </div>
    );
  }

  if ("error" in searchParams) {
    return (
      <div className="w-full flex-1 flex items-center h-screen sm:max-w-md justify-center gap-2 p-4">
        <FormMessage message={searchParams} />
      </div>
    );
  }

  return (
    <>
      <form className="flex flex-col min-w-64 mx-auto">
        <h1 className="text-2xl font-medium">新規登録</h1>
        <p className="text-sm text text-foreground">
          すでにアカウントをお持ちですか？
          <Link className="text-primary font-medium underline" href="/sign-in">
            ログイン
          </Link>
        </p>
        <div className="flex flex-col gap-2 [&>input]:mb-3 mt-8">
          <Label htmlFor="name">お名前</Label>
          <Input name="name" placeholder="ヘラちゃん" required />
          <Label htmlFor="email">メールアドレス</Label>
          <Input name="email" placeholder="you@example.com" required />
          <Label htmlFor="password">パスワード</Label>
          <Input
            type="password"
            name="password"
            placeholder="パスワードを入力してください"
            minLength={6}
            required
          />
          <SubmitButton formAction={signUpAction} pendingText="登録中...">
            登録
          </SubmitButton>
          <FormMessage message={searchParams} />
        </div>
      </form>
    </>
  );
}
