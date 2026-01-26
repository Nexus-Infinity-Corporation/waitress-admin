import { useActionState, useState } from "react";
import { createEmployeeAction } from "@/app/[locale]/employees/services/create-employee.service";

const initialState: { errors?: Record<string, string[]>; message?: string } = {
  errors: undefined,
  message: undefined,
};

export function useEmployeeCreate() {
  const [state, formAction, pending] = useActionState(
    createEmployeeAction,
    initialState
  );

  const [openCreateModal, setOpenCreateModal] = useState(false);

  return {
    state,
    createEmployeeAction: formAction,
    pending,
    setOpenCreateModal,
    openCreateModal,
  };
}
