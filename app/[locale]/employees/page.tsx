import { Suspense } from "react";
import { HorizontalHeader } from "@/components/dashboard/horizontal-header";
import { NavigationClient } from "@/components/dashboard/navigation-client";
import { EmployeesTable } from "./components/employees-table";
import { getCachedEmployees } from "./services/employees.service";
import {
  getBusinesses,
  getBranches,
} from "./services/employee-form-data.service";
import { EmployeesTableSkeleton } from "@/components/dashboard/employees-table-skeleton";
import { getNavigationItems } from "@/services/navigation.service";

async function EmployeesTableWrapper() {
  const [employees, businesses, branches] = await Promise.all([
    getCachedEmployees(),
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
  // Authentication is handled by middleware (proxy.ts)
  const navItems = await getNavigationItems();

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <HorizontalHeader />
      <main className="flex flex-1 flex-row overflow-hidden">
        <NavigationClient items={navItems} />
        <div className="flex-1 overflow-y-auto p-6 animate-in fade-in duration-1000">
          <div className="mx-auto max-w-7xl">
            <Suspense fallback={<EmployeesTableSkeleton />}>
              <EmployeesTableWrapper />
            </Suspense>
          </div>
        </div>
      </main>
    </div>
  );
}
