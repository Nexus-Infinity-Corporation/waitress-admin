"use client";

import { startTransition, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { useCreateAdministrator } from "@/app/[locale]/administrators/hooks/useCreateAdministrator";

interface ModalAdministratorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ModalAdministrator({
  open,
  onOpenChange,
}: ModalAdministratorProps) {
  const { state, createAdministratorAction, pending } =
    useCreateAdministrator();

  const [showPassword, setShowPassword] = useState(false);

  // Close modal on successful creation
  useEffect(() => {
    if (state?.message && !pending) {
      startTransition(() => {
        setTimeout(() => {
          onOpenChange(false);
          // Reset form by reloading or using router.refresh()
          window.location.reload();
        }, 1000);
      });
    }
  }, [state?.message, pending, onOpenChange]);

  const handleSubmit = (formData: FormData) => {
    startTransition(() => {
      createAdministratorAction(formData);
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto transition-all duration-1000 ease-in-out">
        <DialogHeader>
          <DialogTitle>Create New Administrator</DialogTitle>
          <DialogDescription>
            Add a new administrator or brand owner to the system. Fill in the
            required information below.
          </DialogDescription>
        </DialogHeader>

        <form action={handleSubmit} className="space-y-4">
          {/* Personal Information Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Personal Information</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">
                  First Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="firstName"
                  name="firstName"
                  placeholder="John"
                  required
                  disabled={pending}
                  aria-invalid={state?.errors?.firstName ? "true" : "false"}
                  aria-describedby={
                    state?.errors?.firstName ? "firstName-error" : undefined
                  }
                  className="transition-all duration-1000 ease-in-out focus:scale-[1.02] focus:shadow-md"
                />
                {state?.errors?.firstName && (
                  <p
                    id="firstName-error"
                    className="text-sm text-destructive"
                    role="alert"
                  >
                    {state.errors.firstName[0]}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  placeholder="Doe"
                  disabled={pending}
                  aria-invalid={state?.errors?.lastName ? "true" : "false"}
                />
                {state?.errors?.lastName && (
                  <p className="text-sm text-destructive" role="alert">
                    {state.errors.lastName[0]}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="john.doe@example.com"
                required
                disabled={pending}
                aria-invalid={state?.errors?.email ? "true" : "false"}
                aria-describedby={
                  state?.errors?.email ? "email-error" : undefined
                }
                className="transition-all duration-1000 ease-in-out focus:scale-[1.02] focus:shadow-md"
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+1 234-567-8900"
                  disabled={pending}
                  aria-invalid={state?.errors?.phone ? "true" : "false"}
                />
                {state?.errors?.phone && (
                  <p className="text-sm text-destructive" role="alert">
                    {state.errors.phone[0]}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <select
                  id="role"
                  name="role"
                  defaultValue="administrator"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-1000 ease-in-out focus:scale-[1.02] focus:shadow-md"
                  disabled={pending}
                >
                  <option value="administrator">Administrator</option>
                  <option value="brand_owner">Brand Owner</option>
                  <option value="super_admin">Super Admin</option>
                </select>
                {state?.errors?.role && (
                  <p className="text-sm text-destructive" role="alert">
                    {state.errors.role[0]}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">
                Password <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  required
                  disabled={pending}
                  aria-invalid={state?.errors?.password ? "true" : "false"}
                  aria-describedby={
                    state?.errors?.password ? "password-error" : undefined
                  }
                  className="pr-10 transition-all duration-1000 ease-in-out focus:scale-[1.02] focus:shadow-md"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors duration-1000 ease-in-out"
                  disabled={pending}
                  aria-label={showPassword ? "Hide password" : "Show password"}
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
          </div>

          {/* Form-level errors */}
          {state?.errors?._form && (
            <div className="rounded-md bg-destructive/15 p-3">
              <p className="text-sm text-destructive" role="alert">
                {state.errors._form[0]}
              </p>
            </div>
          )}

          {/* Success message */}
          {state?.message && (
            <div className="rounded-md bg-green-500/15 p-3">
              <p
                className="text-sm text-green-700 dark:text-green-400"
                role="alert"
              >
                {state.message}
              </p>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={pending}
              className="transition-all duration-1000 ease-in-out hover:scale-105 hover:shadow-md active:scale-95"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={pending}
              className="transition-all duration-1000 ease-in-out hover:scale-105 hover:shadow-md active:scale-95"
            >
              {pending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Administrator"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
