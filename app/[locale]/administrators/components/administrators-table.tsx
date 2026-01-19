"use client";

import { DataTable, type ColumnDef } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Administrator } from "@/app/[locale]/administrators/types/administrator";

interface AdministratorsTableProps {
  data: Administrator[];
}

export function AdministratorsTable({ data }: AdministratorsTableProps) {
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
            administrator.status === "Active"
              ? "success"
              : administrator.status === "Suspended"
                ? "warning"
                : "destructive"
          }
        >
          {administrator.status}
        </Badge>
      ),
    },
    {
      key: "totalOrders",
      header: "Orders",
    },
    {
      key: "totalSpent",
      header: "Total Spent",
    },
  ];

  return (
    <DataTable
      title="Administrators and Brand Owners"
      data={data}
      columns={columns}
      searchKey="name"
      searchPlaceholder="Search administrators and brand owners..."
      onAdd={() => console.log("Add administrator and brand owner")}
      onEdit={(administrator) => console.log("Edit", administrator)}
      onDelete={(administrator) => console.log("Delete", administrator)}
    />
  );
}
