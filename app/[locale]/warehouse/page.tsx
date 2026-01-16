import { HorizontalHeader } from "@/components/dashboard/horizontal-header";
import { WarehouseTable } from "@/components/dashboard/warehouse-table";
import { getWarehouseItems } from "@/services/warehouse.service";
import { requireAuth } from "@/lib/auth";

export default async function WarehousePage() {
  // Ensure user is authenticated (fallback check)
  await requireAuth("/warehouse");

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
