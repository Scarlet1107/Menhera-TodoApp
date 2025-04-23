"use server";

import { encodedRedirect } from "@/utils/utils";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
if (!siteUrl) {
  throw new Error("NEXT_PUBLIC_SITE_URL is not defined");
}

export const signUpAction = async (formData: FormData) => {
  const name = formData.get("name")?.toString();
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const supabase = await createClient();

  if (!name) {
    return encodedRedirect("error", "/sign-up", "お名前は必須です。");
  }

  if (!email) {
    return encodedRedirect("error", "/sign-up", "メールアドレスは必須です。");
  }

  if (!password) {
    return encodedRedirect("error", "/sign-up", "パスワードは必須です。");
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${siteUrl}/sign-in`,
      data: {
        display_name: name,
      },
    },
  });

  if (error) {
    console.error(error.code + " " + error.message);
    return encodedRedirect("error", "/sign-up", error.message);
  } else if (!data.user) {
    return encodedRedirect(
      "error",
      "/sign-up",
      "アカウントを正しく作成できませんでした。開発者にお問い合わせください"
    );
  }

  return encodedRedirect(
    "success",
    "/sign-up",
    "ご登録ありがとうございます！確認用リンクが記載されたメールをご確認ください。"
  );
};

export const signInAction = async (formData: FormData) => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    return encodedRedirect("error", "/sign-in", "ログインに失敗しました。");
  }

  return redirect("/protected/home");
};

export const forgotPasswordAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const supabase = await createClient();
  const callbackUrl = formData.get("callbackUrl")?.toString();

  if (!email) {
    return encodedRedirect(
      "error",
      "/forgot-password",
      "メールアドレスは必須です。"
    );
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/auth/callback?redirect_to=/protected/reset-password`,
  });

  if (error) {
    console.error(error.message);
    return encodedRedirect(
      "error",
      "/forgot-password",
      "パスワードリセットに失敗しました。"
    );
  }

  if (callbackUrl) {
    return redirect(callbackUrl);
  }

  return encodedRedirect(
    "success",
    "/forgot-password",
    "パスワードリセット用のリンクを記載したメールを確認してください。"
  );
};

export const resetPasswordAction = async (formData: FormData) => {
  const supabase = await createClient();
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || !confirmPassword) {
    return encodedRedirect(
      "error",
      "/protected/reset-password",
      "パスワードと確認用パスワードは必須です。"
    );
  }

  if (password !== confirmPassword) {
    return encodedRedirect(
      "error",
      "/protected/reset-password",
      "パスワードが一致しません。"
    );
  }

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    return encodedRedirect(
      "error",
      "/protected/reset-password",
      "パスワードの更新に失敗しました。"
    );
  }

  return encodedRedirect(
    "success",
    "/protected/reset-password",
    "パスワードが更新されました。"
  );
};

export const signOutAction = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect("/sign-in");
};
