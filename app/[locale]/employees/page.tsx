import { HorizontalHeader } from "@/components/dashboard/horizontal-header";
import { EmployeesTable } from "@/components/dashboard/employees-table";
import { getEmployees } from "@/services/employees.service";

export default async function EmployeesPage() {
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
