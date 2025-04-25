import { resetPasswordAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { redirect } from "next/navigation";

export default async function ResetPassword(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;
  const handleSubmit = async (formData: FormData) => {
    "use server";
    await resetPasswordAction(formData);
    redirect("/sign-in");
  };

  return (
    <form className="flex flex-col w-full max-w-md p-4 gap-2 [&>input]:mb-4">
      <h1 className="text-2xl font-medium">パスワードを変更</h1>
      <p className="text-sm text-foreground/60">
        新しいパスワードを以下に入力してください。
      </p>
      <Label htmlFor="password">新しいパスワード</Label>
      <Input
        type="password"
        name="password"
        placeholder="新しいパスワード"
        required
      />
      <Label htmlFor="confirmPassword">パスワードの確認</Label>
      <Input
        type="password"
        name="confirmPassword"
        placeholder="パスワードの確認"
        required
      />
      <SubmitButton formAction={handleSubmit}>変更</SubmitButton>
      <FormMessage message={searchParams} />
    </form>
  );
}
