"use client";

import { useState } from "react";
import { DataTable, type ColumnDef } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Administrator } from "@/app/[locale]/administrators/types/administrator";
import { ModalAdministrator } from "./ModalAdministrator";
import { ModalDelete } from "@/components/generic-modals/modal-delete";
import { useDeleteAdministrator } from "../hooks/useDeleteAdministrator";

interface AdministratorsTableProps {
  data: Administrator[];
  currentUserRoleLevel: number | null;
}

export function AdministratorsTable({
  data,
  currentUserRoleLevel,
}: AdministratorsTableProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);

  const {
    openDeleteModal,
    setOpenDeleteModal,
    openDeleteConfirmation,
    deleteAdministrator,
    pending: isDeleting,
  } = useDeleteAdministrator();

  const columns: ColumnDef<Administrator>[] = [
    {
      key: "name",
      header: "Name",
      render: (administrator) => (
        <div>
          <p className="text-sm font-medium">{administrator.name}</p>
          <p className="text-xs text-muted-foreground">{administrator.email}</p>
        </div>
      ),
    },
    {
      key: "email",
      header: "Email",
    },
    {
      key: "phone",
      header: "Phone",
    },
    {
      key: "role",
      header: "Role",
      render: (administrator) => (
        <div>
          <p className="text-sm">{administrator.role}</p>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (administrator) => (
        <Badge
          variant={
            administrator.status === "active"
              ? "success"
              : administrator.status === "suspended"
                ? "warning"
                : "destructive"
          }
        >
          {administrator.status.charAt(0).toUpperCase() +
            administrator.status.slice(1)}
        </Badge>
      ),
    },
  ];

  return (
    <>
      <DataTable
        title="Administrators and Brand Owners"
        data={data}
        columns={columns}
        searchKey="name"
        searchPlaceholder="Search administrators and brand owners..."
        onAdd={() => setIsModalOpen(true)}
        onEdit={() => setOpenEditModal(true)}
        onDelete={(administrator) => openDeleteConfirmation(administrator.id)}
      />
      <ModalAdministrator
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        currentUserRoleLevel={currentUserRoleLevel}
      />
      <ModalDelete
        open={openDeleteModal}
        onOpenChange={setOpenDeleteModal}
        onDelete={deleteAdministrator}
        isDeleting={isDeleting}
        title="Delete Administrator"
      />
    </>
  );
}
