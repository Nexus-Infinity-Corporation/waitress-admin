"use client";

import { useActionState, startTransition, useEffect, Suspense } from "react";
import { loginAction } from "../services/login.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";

const initialState = {
  errors: undefined,
  message: undefined,
};

function LoginFormContent() {
  const t = useTranslations("login");
  const router = useRouter();
  const searchParams = useSearchParams();
  const [state, formAction, pending] = useActionState(
    loginAction,
    initialState
  );
  const [showPassword, setShowPassword] = useState(false);

  // Handle successful login redirect
  useEffect(() => {
    if (state?.message && !pending) {
      startTransition(() => {
        // Redirect to the original URL if provided, otherwise go to dashboard
        const redirectTo = searchParams.get("redirect");
        router.push(redirectTo || "/dashboard");
      });
    }
  }, [state?.message, pending, router, searchParams]);

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          {t("title")}
        </CardTitle>
        <CardDescription className="text-center">
          {t("description")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          action={(formData) => startTransition(() => formAction(formData))}
          className="space-y-4"
        >
          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email">{t("emailLabel")}</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder={t("emailPlaceholder")}
              required
              disabled={pending}
              aria-invalid={state?.errors?.email ? "true" : "false"}
              aria-describedby={
                state?.errors?.email ? "email-error" : undefined
              }
            />
            {state?.errors?.email && (
              <p
                id="email-error"
                className="text-sm text-destructive"
                role="alert"
              >
                {state.errors.email[0]}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <Label htmlFor="password">{t("passwordLabel")}</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder={t("passwordPlaceholder")}
                required
                disabled={pending}
                aria-invalid={state?.errors?.password ? "true" : "false"}
                aria-describedby={
                  state?.errors?.password ? "password-error" : undefined
                }
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                disabled={pending}
                aria-label={
                  showPassword ? t("hidePassword") : t("showPassword")
                }
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {state?.errors?.password && (
              <p
                id="password-error"
                className="text-sm text-destructive"
                role="alert"
              >
                {state.errors.password[0]}
              </p>
            )}
          </div>

          {/* Form-level errors */}
          {state?.errors?._form && (
            <div className="rounded-md bg-destructive/15 p-3">
              <p className="text-sm text-destructive" role="alert">
                {state.errors._form[0]}
              </p>
            </div>
          )}

          {/* Submit Button */}
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("loggingIn")}
              </>
            ) : (
              t("submitButton")
            )}
          </Button>

          {/* Forgot Password Link */}
          <div className="text-center text-sm">
            <a
              href="#"
              className="text-primary hover:underline"
              onClick={(e) => {
                e.preventDefault();
                // TODO: Implement forgot password functionality
              }}
            >
              {t("forgotPassword")}
            </a>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export function LoginFormClient() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-md animate-pulse bg-muted h-96 rounded-lg" />
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}
