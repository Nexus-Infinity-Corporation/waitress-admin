"use client";

import { useActionState, useEffect } from "react";
import { createAdministratorAction } from "@/app/[locale]/administrators/services/create-administrator.service";

const initialState: { errors?: Record<string, string[]>; message?: string } = {
  errors: undefined,
  message: undefined,
};

/**
 * Hook for creating administrators
 * Uses useActionState to manage form state and server action
 */
export function useCreateAdministrator() {
  const [state, formAction, pending] = useActionState(
    createAdministratorAction,
    initialState
  );

  return {
    state,
    createAdministratorAction: formAction,
    pending,
  };
}
