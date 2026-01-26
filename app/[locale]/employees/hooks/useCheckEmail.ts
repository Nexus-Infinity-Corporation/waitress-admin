"use client";

import { useState, useCallback } from "react";
import { checkEmailExistsAction } from "../services/check-email.service";

export type EmailCheckStatus = "idle" | "checking" | "exists" | "new";

interface UseCheckEmailReturn {
  status: EmailCheckStatus;
  existingUserId: string | undefined;
  checkEmail: (email: string) => Promise<void>;
  reset: () => void;
}

/**
 * Custom hook to check if an email already exists in the system
 * @returns Object with status, existingUserId, checkEmail function, and reset function
 */
export function useCheckEmail(): UseCheckEmailReturn {
  const [status, setStatus] = useState<EmailCheckStatus>("idle");
  const [existingUserId, setExistingUserId] = useState<string | undefined>(
    undefined
  );

  const checkEmail = useCallback(async (email: string) => {
    // Validate email format
    if (!email || !email.includes("@")) {
      setStatus("idle");
      setExistingUserId(undefined);
      return;
    }

    setStatus("checking");

    try {
      const result = await checkEmailExistsAction(email);

      if (result.exists) {
        setStatus("exists");
        setExistingUserId(result.userId);
      } else {
        setStatus("new");
        setExistingUserId(undefined);
      }
    } catch {
      setStatus("idle");
      setExistingUserId(undefined);
    }
  }, []);

  const reset = useCallback(() => {
    setStatus("idle");
    setExistingUserId(undefined);
  }, []);

  return {
    status,
    existingUserId,
    checkEmail,
    reset,
  };
}
