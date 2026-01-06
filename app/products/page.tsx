import { HorizontalHeader } from "@/components/dashboard/horizontal-header"
import { ProductsTable } from "@/components/dashboard/products-table"
import { getProducts } from "@/services/products.service"

export default async function ProductsPage() {
  const products = await getProducts()

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <HorizontalHeader />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-7xl">
          <ProductsTable data={products} />
        </div>
      </main>
    </div>
  )
}

