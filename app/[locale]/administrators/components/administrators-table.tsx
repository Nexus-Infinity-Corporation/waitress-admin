"use client";

import { useState } from "react";
import { DataTable, type ColumnDef } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Administrator } from "@/app/[locale]/administrators/types/administrator";
import { ModalAdministrator } from "./ModalAdministrator";

interface AdministratorsTableProps {
  data: Administrator[];
}

export function AdministratorsTable({ data }: AdministratorsTableProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

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
        onEdit={(administrator) => console.log("Edit", administrator)}
        onDelete={(administrator) => console.log("Delete", administrator)}
      />
      <ModalAdministrator open={isModalOpen} onOpenChange={setIsModalOpen} />
    </>
  );
}
