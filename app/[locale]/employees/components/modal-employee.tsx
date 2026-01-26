"use client";

import {
  useActionState,
  startTransition,
  useEffect,
  useMemo,
  useState,
  useRef,
} from "react";
import { createEmployeeAction } from "../services/create-employee.service";
import { useCheckEmail } from "../hooks/useCheckEmail";
import { useGetRoles } from "@/app/hooks/useGetRoles";
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
import {
  Loader2,
  Eye,
  EyeOff,
  Mail,
  CheckCircle2,
  UserPlus,
  UserCheck,
  AlertTriangle,
} from "lucide-react";
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
  const emailInputRef = useRef<HTMLInputElement>(null);

  // Use the custom hook for email checking
  const {
    status: emailStatus,
    isActive: userIsActive,
    userName: existingUserName,
    checkEmail,
    reset: resetEmailCheck,
  } = useCheckEmail();

  // Fetch roles from Supabase
  const { roles, loading: rolesLoading } = useGetRoles();

  // Filter branches based on selected business (derived state)
  const filteredBranches = useMemo(() => {
    if (selectedBusinessId) {
      return branches.filter(
        (branch) => branch.businessId === selectedBusinessId
      );
    }
    return branches;
  }, [selectedBusinessId, branches]);

  // Reset email check when modal closes
  useEffect(() => {
    if (!open) {
      resetEmailCheck();
    }
  }, [open, resetEmailCheck]);

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

  // Handle email check button click
  const handleCheckEmail = () => {
    const email = emailInputRef.current?.value || "";
    checkEmail(email);
  };

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
            <div className="space-y-2">
              <Label htmlFor="email">
                Email <span className="text-destructive">*</span>
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  ref={emailInputRef}
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
                  onChange={() => {
                    // Reset status when email changes
                    if (emailStatus !== "idle") {
                      resetEmailCheck();
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCheckEmail}
                  disabled={pending || emailStatus === "checking"}
                  className={
                    emailStatus === "exists" && userIsActive
                      ? "text-green-500 border-green-500 hover:bg-green-50 dark:hover:bg-green-950"
                      : emailStatus === "exists" && !userIsActive
                        ? "text-amber-500 border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950"
                        : emailStatus === "new"
                          ? "text-blue-500 border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950"
                          : ""
                  }
                >
                  {emailStatus === "checking" && (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Checking...
                    </>
                  )}
                  {emailStatus === "exists" && userIsActive && (
                    <>
                      <UserCheck className="h-4 w-4 mr-2" />
                      User Found
                    </>
                  )}
                  {emailStatus === "exists" && !userIsActive && (
                    <>
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      User Inactive
                    </>
                  )}
                  {emailStatus === "new" && (
                    <>
                      <UserPlus className="h-4 w-4 mr-2" />
                      New Email
                    </>
                  )}
                  {emailStatus === "idle" && (
                    <>
                      <Mail className="h-4 w-4 mr-2" />
                      Check Email
                    </>
                  )}
                </Button>
              </div>
              {/* Status messages */}
              {emailStatus === "exists" && userIsActive && (
                <div className="rounded-md bg-green-50 dark:bg-green-950/50 p-3 border border-green-200 dark:border-green-800">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-green-700 dark:text-green-300">
                      <p className="font-medium">
                        User found
                        {existingUserName ? `: ${existingUserName}` : ""}
                      </p>
                      <p className="text-green-600 dark:text-green-400">
                        This user will be assigned as an employee.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              {emailStatus === "exists" && !userIsActive && (
                <div className="rounded-md bg-amber-50 dark:bg-amber-950/50 p-3 border border-amber-200 dark:border-amber-800">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-amber-700 dark:text-amber-300">
                      <p className="font-medium">
                        Inactive user found
                        {existingUserName ? `: ${existingUserName}` : ""}
                      </p>
                      <p className="text-amber-600 dark:text-amber-400">
                        This user will be activated and assigned as an employee.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              {emailStatus === "new" && (
                <div className="rounded-md bg-blue-50 dark:bg-blue-950/50 p-3 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-start gap-2">
                    <UserPlus className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-700 dark:text-blue-300">
                      <p className="font-medium">New email address</p>
                      <p className="text-blue-600 dark:text-blue-400">
                        A new user account will be created.
                      </p>
                    </div>
                  </div>
                </div>
              )}
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
            {/* Show name fields only after email check confirms new user */}
            {emailStatus === "new" && (
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
            )}

            {/* Show phone only for new users */}
            {emailStatus === "new" && (
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
            )}
            {/* Show address and age only after email check confirms new user */}
            {emailStatus === "new" && (
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
            )}
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
                  disabled={pending || rolesLoading}
                >
                  <option value="">Select role</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id.toString()}>
                      {role.display_name || role.name}
                    </option>
                  ))}
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
