import { HorizontalHeader } from "@/components/dashboard/horizontal-header";
import { EmployeesTable } from "@/components/dashboard/employees-table";
import { getEmployees } from "@/services/employees.service";
import { requireAuth } from "@/lib/auth";

export default async function EmployeesPage() {
  // Ensure user is authenticated (fallback check)
  await requireAuth("/employees");

  const employees = await getEmployees();

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <HorizontalHeader />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-7xl">
          <EmployeesTable data={employees} />
        </div>
      </main>
    </div>
  );
}
