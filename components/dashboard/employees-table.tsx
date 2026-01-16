"use client";

import { useState } from "react";
import { DataTable, type ColumnDef } from "./data-table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { Employee } from "@/types/restaurant";
import { CreateEmployeeModal } from "@/app/[locale]/employees/components/create-employee-modal";
import type {
  BusinessOption,
  BranchOption,
} from "@/app/[locale]/employees/services/employee-form-data.service";

interface EmployeesTableProps {
  data: Employee[];
  businesses?: BusinessOption[];
  branches?: BranchOption[];
}

export function EmployeesTable({
  data,
  businesses = [],
  branches = [],
}: EmployeesTableProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const columns: ColumnDef<Employee>[] = [
    {
      key: "name",
      header: "Employee",
      render: (employee) => (
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback>
              {employee.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">{employee.name}</p>
            <p className="text-xs text-muted-foreground">{employee.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
    },
    {
      key: "phone",
      header: "Phone",
      render: (employee) => (
        <span className="text-sm">{employee.phone || "N/A"}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (employee) => (
        <Badge
          variant={
            employee.status === "Active"
              ? "success"
              : employee.status === "On Leave"
                ? "warning"
                : "destructive"
          }
        >
          {employee.status}
        </Badge>
      ),
    },
    {
      key: "hireDate",
      header: "Hire Date",
    },
    {
      key: "salary",
      header: "Salary",
    },
  ];

  return (
    <>
      <DataTable
        title="Employees"
        data={data}
        columns={columns}
        searchKey="name"
        searchPlaceholder="Search employees..."
        onAdd={() => setIsModalOpen(true)}
        onEdit={(employee) => console.log("Edit", employee)}
        onDelete={(employee) => console.log("Delete", employee)}
      />
      <CreateEmployeeModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        businesses={businesses}
        branches={branches}
      />
    </>
  );
}
