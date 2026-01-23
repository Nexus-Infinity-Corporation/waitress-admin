"use client";

import { useActionState, useEffect } from "react";
import { createAdministratorAction } from "../services/create-administrator.service";

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

  // Log state changes
  useEffect(() => {
    console.log("🔄 [HOOK] useActionState state changed:", {
      hasMessage: !!state?.message,
      hasErrors: !!state?.errors,
      pending,
      stateKeys: state ? Object.keys(state) : [],
    });
  }, [state, pending]);

  return {
    state,
    createAdministratorAction: formAction,
    pending,
  };
}
