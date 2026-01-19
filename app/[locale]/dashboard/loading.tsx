import { HeaderSkeleton } from "@/components/dashboard/header-skeleton";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";

export default function DashboardLoading() {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <HeaderSkeleton />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-7xl">
          <DashboardSkeleton />
        </div>
      </main>
    </div>
  );
}
