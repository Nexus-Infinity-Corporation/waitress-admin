import { Suspense } from "react";
import { HorizontalHeader } from "@/components/dashboard/horizontal-header";
import { EmployeesTable } from "./components/employees-table";
import { getEmployees } from "./services/employees.service";
import { requireAuth } from "@/lib/auth";
import {
  getBusinesses,
  getBranches,
} from "./services/employee-form-data.service";
import { EmployeesTableSkeleton } from "@/components/dashboard/employees-table-skeleton";

async function EmployeesTableWrapper() {
  const [employees, businesses, branches] = await Promise.all([
    getEmployees(),
    getBusinesses(),
    getBranches(),
  ]);

  return (
    <EmployeesTable
      data={employees}
      businesses={businesses}
      branches={branches}
    />
  );
}

export default async function EmployeesPage() {
  // Ensure user is authenticated (fallback check)
  await requireAuth("/employees");

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <HorizontalHeader />
      <main className="flex-1 overflow-y-auto p-6 animate-in fade-in duration-1000">
        <div className="mx-auto max-w-7xl">
          <Suspense fallback={<EmployeesTableSkeleton />}>
            <EmployeesTableWrapper />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
