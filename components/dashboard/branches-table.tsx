"use client";

import { DataTable, type ColumnDef } from "./data-table";
import { Badge } from "@/components/ui/badge";
import type { Branch } from "@/shared/types/restaurant";

interface BranchesTableProps {
  data: Branch[];
}

export function BranchesTable({ data }: BranchesTableProps) {
  const columns: ColumnDef<Branch>[] = [
    {
      key: "name",
      header: "Branch Name",
      render: (branch) => (
        <div>
          <p className="text-sm font-medium">{branch.name}</p>
          <p className="text-xs text-muted-foreground">{branch.businessName}</p>
        </div>
      ),
    },
    {
      key: "city",
      header: "Location",
      render: (branch) => (
        <div>
          <p className="text-sm">{branch.city}</p>
          <p className="text-xs text-muted-foreground">{branch.address}</p>
        </div>
      ),
    },
    {
      key: "phone",
      header: "Phone",
    },
    {
      key: "openingHours",
      header: "Opening Hours",
    },
    {
      key: "totalEmployees",
      header: "Employees",
    },
    {
      key: "status",
      header: "Status",
      render: (branch) => (
        <Badge
          variant={
            branch.status === "Active"
              ? "success"
              : branch.status === "Inactive"
                ? "destructive"
                : "warning"
          }
        >
          {branch.status}
        </Badge>
      ),
    },
  ];

  return (
    <DataTable
      title="Branches"
      data={data}
      columns={columns}
      searchKey="name"
      searchPlaceholder="Search branches..."
      onAdd={() => console.log("Add branch")}
      onEdit={(branch) => console.log("Edit", branch)}
      onDelete={(branch) => console.log("Delete", branch)}
    />
  );
}
