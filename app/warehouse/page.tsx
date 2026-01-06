import { HorizontalHeader } from "@/components/dashboard/horizontal-header"
import { WarehouseTable } from "@/components/dashboard/warehouse-table"
import { getWarehouseItems } from "@/services/warehouse.service"

export default async function WarehousePage() {
  const items = await getWarehouseItems()

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <HorizontalHeader />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-7xl">
          <WarehouseTable data={items} />
        </div>
      </main>
    </div>
  )
}

