import { HorizontalHeader } from "@/components/dashboard/horizontal-header";
import { WarehouseTable } from "./components/warehouse-table";
import { getWarehouseItems } from "./services/warehouse.service";

// Cache this page for 1 hour since it uses mocked data
export const revalidate = 3600;

export default async function WarehousePage() {
  // Authentication is handled by middleware (proxy.ts)
  const items = await getWarehouseItems();

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <HorizontalHeader />
      <main className="flex-1 overflow-y-auto p-6 animate-in fade-in duration-1000">
        <div className="mx-auto max-w-7xl">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000 ease-in-out">
            <WarehouseTable data={items} />
          </div>
        </div>
      </main>
    </div>
  );
}
