import { LoginFormClient } from "./components/login-form-client";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("login");

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-muted p-4">
      <div className="w-full max-w-md">
        <LoginFormClient />
      </div>
    </div>
  );
}
