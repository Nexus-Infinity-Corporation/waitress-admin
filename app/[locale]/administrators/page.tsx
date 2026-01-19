import { HorizontalHeader } from "@/components/dashboard/horizontal-header";
import { AdministratorsTable } from "./components/administrators-table";
import { getAdministrators } from "./services/administrators.service";

// Cache this page for 1 hour since it uses mocked data
export const revalidate = 3600;

export default async function ClientsPage() {
  // Authentication is handled by middleware (proxy.ts)
  const administrators = await getAdministrators();

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <HorizontalHeader />
      <main className="flex-1 overflow-y-auto p-6 animate-in fade-in duration-1000">
        <div className="mx-auto max-w-7xl">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000 ease-in-out">
            <AdministratorsTable data={administrators} />
          </div>
        </div>
      </main>
    </div>
  );
}
