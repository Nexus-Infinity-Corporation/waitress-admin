import { HorizontalHeader } from "@/components/dashboard/horizontal-header";
import { EmployeesTable } from "@/components/dashboard/employees-table";
import { getEmployees } from "@/services/employees.service";
import { requireAuth } from "@/lib/auth";
import {
  getBusinesses,
  getBranches,
} from "./services/employee-form-data.service";

export default async function EmployeesPage() {
  // Ensure user is authenticated (fallback check)
  await requireAuth("/employees");

  const [employees, businesses, branches] = await Promise.all([
    getEmployees(),
    getBusinesses(),
    getBranches(),
  ]);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <HorizontalHeader />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-7xl">
          <EmployeesTable
            data={employees}
            businesses={businesses}
            branches={branches}
          />
        </div>
      </main>
    </div>
  );
}
