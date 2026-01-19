import { HorizontalHeader } from "@/components/dashboard/horizontal-header";
import { BranchesTable } from "./components/branches-table";
import { getBranches } from "./services/branches.service";

// Cache this page for 1 hour since it uses mocked data
export const revalidate = 3600;

export default async function BranchesPage() {
  // Authentication is handled by middleware (proxy.ts)
  const branches = await getBranches();

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <HorizontalHeader />
      <main className="flex-1 overflow-y-auto p-6 animate-in fade-in duration-1000">
        <div className="mx-auto max-w-7xl">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000 ease-in-out">
            <BranchesTable data={branches} />
          </div>
        </div>
      </main>
    </div>
  );
}
