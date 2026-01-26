"use client";

import {
  useActionState,
  useCallback,
  useEffect,
  useRef,
  useState,
  startTransition,
} from "react";
import { deleteAdministratorAction } from "@/app/[locale]/administrators/services/delete-administrator.service";

const initialState: { errors?: Record<string, string[]>; message?: string } = {
  errors: undefined,
  message: undefined,
};

/**
 * Hook for deleting administrators
 * Uses useActionState to manage form state and server action
 */
export function useDeleteAdministrator() {
  const [state, formAction, pending] = useActionState(
    deleteAdministratorAction,
    initialState
  );

  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [selectedAdministratorId, setSelectedAdministratorId] = useState<
    string | null
  >(null);

  // Track previous message to detect changes
  const prevMessageRef = useRef(state?.message);

  // Close modal on successful deletion
  useEffect(() => {
    const hasNewMessage =
      state?.message && state.message !== prevMessageRef.current;
    prevMessageRef.current = state?.message;

    if (hasNewMessage && !pending) {
      startTransition(() => {
        setOpenDeleteModal(false);
        setSelectedAdministratorId(null);
      });
    }
  }, [state?.message, pending]);

  const openDeleteConfirmation = useCallback((administratorId: string) => {
    setSelectedAdministratorId(administratorId);
    setOpenDeleteModal(true);
  }, []);

  const closeDeleteConfirmation = useCallback(() => {
    setOpenDeleteModal(false);
    setSelectedAdministratorId(null);
  }, []);

  const deleteAdministrator = useCallback(() => {
    if (!selectedAdministratorId) return;

    const formData = new FormData();
    formData.append("administratorId", selectedAdministratorId);
    formAction(formData);
  }, [selectedAdministratorId, formAction]);

  return {
    state,
    pending,
    openDeleteModal,
    selectedAdministratorId,
    openDeleteConfirmation,
    closeDeleteConfirmation,
    setOpenDeleteModal,
    deleteAdministrator,
  };
}
