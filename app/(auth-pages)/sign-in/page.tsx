import { signInAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import GoogleLoginButton from "@/components/googleLoginButton";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default async function Login(props: { searchParams: Promise<Message> }) {
  const searchParams = await props.searchParams;
  return (
    <form className="flex-1 flex flex-col min-w-64 mt-4 mx-8">
      <h1 className="text-2xl font-medium">ログイン</h1>
      <p className="text-sm text-foreground">
        アカウントをお持ちでない方は{" "}
        <Link
          className="text-foreground font-medium underline hover:text-blue-500"
          href="/sign-up"
        >
          新規登録
        </Link>
        してください。
      </p>
      <div className="flex flex-col gap-2 [&>input]:mb-3 mt-8">
        <Label htmlFor="email">メールアドレス</Label>
        <Input name="email" placeholder="you@example.com" required />
        <div className="flex justify-between items-center">
          <Label htmlFor="password">パスワード</Label>
          <Link
            className="text-xs text-foreground underline hover:text-blue-500"
            href="/forgot-password"
          >
            パスワードをお忘れですか？
          </Link>
        </div>
        <Input
          type="password"
          name="password"
          placeholder="パスワードを入力してください"
          required
        />
        <SubmitButton pendingText="ログイン中..." formAction={signInAction}>
          ログイン
        </SubmitButton>
        <FormMessage message={searchParams} />
      </div>
      {/* <GoogleLoginButton /> */}
    </form>
  );
}
