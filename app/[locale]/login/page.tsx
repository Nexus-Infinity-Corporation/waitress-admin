import { LoginFormClient } from "./components/login-form-client";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "@/i18n/routing";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("login");

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function LoginPage({
  params,
}: Readonly<{
  params: Promise<{ locale: string }>;
}>) {
  // If user is already authenticated, redirect to dashboard
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { locale } = await params;
    redirect({ href: "/dashboard", locale });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-muted p-4">
      <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-1000 ease-in-out">
        <LoginFormClient />
      </div>
    </div>
  );
}
