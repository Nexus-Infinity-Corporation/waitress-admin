"use client";

import {
  useActionState,
  startTransition,
  useEffect,
  useMemo,
  useState,
} from "react";
import { createEmployeeAction } from "../services/create-employee.service";
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
import type {
  BusinessOption,
  BranchOption,
} from "../services/employee-form-data.service";

interface CreateEmployeeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  businesses?: BusinessOption[];
  branches?: BranchOption[];
}

const initialState = {
  errors: undefined,
  message: undefined,
};

export function CreateEmployeeModal({
  open,
  onOpenChange,
  businesses = [],
  branches = [],
}: CreateEmployeeModalProps) {
  const [state, formAction, pending] = useActionState(
    createEmployeeAction,
    initialState
  );
  const [showPassword, setShowPassword] = useState(false);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string>("");

  // Filter branches based on selected business (derived state)
  const filteredBranches = useMemo(() => {
    if (selectedBusinessId) {
      return branches.filter(
        (branch) => branch.businessId === selectedBusinessId
      );
    }
    return branches;
  }, [selectedBusinessId, branches]);

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
    startTransition(() => formAction(formData));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto transition-all duration-1000 ease-in-out">
        <DialogHeader>
          <DialogTitle>Create New Employee</DialogTitle>
          <DialogDescription>
            Add a new employee to the system. Fill in the required information
            below.
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
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  name="username"
                  placeholder="johndoe"
                  disabled={pending}
                  aria-invalid={state?.errors?.username ? "true" : "false"}
                />
                {state?.errors?.username && (
                  <p className="text-sm text-destructive" role="alert">
                    {state.errors.username[0]}
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
                  className="pr-10"
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  name="address"
                  placeholder="123 Main St"
                  disabled={pending}
                  aria-invalid={state?.errors?.address ? "true" : "false"}
                />
                {state?.errors?.address && (
                  <p className="text-sm text-destructive" role="alert">
                    {state.errors.address[0]}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  name="age"
                  type="number"
                  min="16"
                  max="100"
                  placeholder="25"
                  disabled={pending}
                  aria-invalid={state?.errors?.age ? "true" : "false"}
                />
                {state?.errors?.age && (
                  <p className="text-sm text-destructive" role="alert">
                    {state.errors.age[0]}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Employment Information Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Employment Information</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <select
                  id="role"
                  name="role"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={pending}
                >
                  <option value="">Select role</option>
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                  <option value="regular">Regular</option>
                </select>
                {state?.errors?.role && (
                  <p className="text-sm text-destructive" role="alert">
                    {state.errors.role[0]}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="position">Position</Label>
                <Input
                  id="position"
                  name="position"
                  placeholder="Manager, Waiter, Chef..."
                  disabled={pending}
                  aria-invalid={state?.errors?.position ? "true" : "false"}
                />
                {state?.errors?.position && (
                  <p className="text-sm text-destructive" role="alert">
                    {state.errors.position[0]}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="businessId">Business</Label>
                <select
                  id="businessId"
                  name="businessId"
                  value={selectedBusinessId}
                  onChange={(e) => setSelectedBusinessId(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={pending}
                >
                  <option value="">Select business</option>
                  {businesses.map((business) => (
                    <option key={business.id} value={business.id}>
                      {business.name}
                    </option>
                  ))}
                </select>
                {state?.errors?.businessId && (
                  <p className="text-sm text-destructive" role="alert">
                    {state.errors.businessId[0]}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="branchId">Branch</Label>
                <select
                  id="branchId"
                  name="branchId"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={pending || !selectedBusinessId}
                >
                  <option value="">Select branch</option>
                  {filteredBranches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name}
                    </option>
                  ))}
                </select>
                {state?.errors?.branchId && (
                  <p className="text-sm text-destructive" role="alert">
                    {state.errors.branchId[0]}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hourlyRate">Hourly Rate</Label>
              <Input
                id="hourlyRate"
                name="hourlyRate"
                type="number"
                step="0.01"
                min="0"
                placeholder="15.00"
                disabled={pending}
                aria-invalid={state?.errors?.hourlyRate ? "true" : "false"}
              />
              {state?.errors?.hourlyRate && (
                <p className="text-sm text-destructive" role="alert">
                  {state.errors.hourlyRate[0]}
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
                "Create Employee"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
