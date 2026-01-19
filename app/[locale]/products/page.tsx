import { HorizontalHeader } from "@/components/dashboard/horizontal-header";
import { ProductsTable } from "./components/products-table";
import { getProducts } from "./services/products.service";

// Cache this page for 1 hour since it uses mocked data
export const revalidate = 3600;

export default async function ProductsPage() {
  // Authentication is handled by middleware (proxy.ts)
  const products = await getProducts();

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <HorizontalHeader />
      <main className="flex-1 overflow-y-auto p-6 animate-in fade-in duration-1000">
        <div className="mx-auto max-w-7xl">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000 ease-in-out">
            <ProductsTable data={products} />
          </div>
        </div>
      </main>
    </div>
  );
}
