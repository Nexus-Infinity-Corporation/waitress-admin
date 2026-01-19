import { HeaderSkeleton } from "@/components/dashboard/header-skeleton";
import { EmployeesTableSkeleton } from "@/components/dashboard/employees-table-skeleton";

export default function EmployeesLoading() {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <HeaderSkeleton />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-7xl">
          <EmployeesTableSkeleton />
        </div>
      </main>
    </div>
  );
}
