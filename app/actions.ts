"use server";

import { encodedRedirect } from "@/utils/utils";
import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

const redirectTo = process.env.NEXT_PUBLIC_SITE_URL;
if (!redirectTo) {
  throw new Error("NEXT_PUBLIC_SITE_URL is not defined");
}

export const signUpAction = async (formData: FormData) => {
  const name = formData.get("name")?.toString();
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const supabase = await createClient();
  const origin = (await headers()).get("origin");

  if (!name) {
    return encodedRedirect("error", "/sign-up", "お名前は必須です。");
  }

  if (!email) {
    return encodedRedirect("error", "/sign-up", "メールアドレスは必須です。");
  }

  if (!password) {
    return encodedRedirect("error", "/sign-up", "パスワードは必須です。");
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: redirectTo,
      data: {
        display_name: name,
      },
    },
  });

  if (error) {
    console.error(error.code + " " + error.message);
    return encodedRedirect("error", "/sign-up", error.message);
  } else {
    return encodedRedirect(
      "success",
      "/sign-up",
      "ご登録ありがとうございます！確認用リンクが記載されたメールをご確認ください。"
    );
  }
};

export const signInAction = async (formData: FormData) => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return encodedRedirect("error", "/sign-in", "ログインに失敗しました。");
  }

  return redirect("/protected/home");
};

export const forgotPasswordAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const supabase = await createClient();
  const origin = (await headers()).get("origin");
  const callbackUrl = formData.get("callbackUrl")?.toString();

  if (!email) {
    return encodedRedirect(
      "error",
      "/forgot-password",
      "メールアドレスは必須です。"
    );
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?redirect_to=/protected/reset-password`,
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
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "パスワードと確認用パスワードは必須です。"
    );
  }

  if (password !== confirmPassword) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "パスワードが一致しません。"
    );
  }

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "パスワードの更新に失敗しました。"
    );
  }

  encodedRedirect(
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
