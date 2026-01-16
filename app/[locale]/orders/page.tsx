import { HorizontalHeader } from "@/components/dashboard/horizontal-header";
import { OrdersTable } from "@/components/dashboard/orders-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, ChevronRight } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { requireAuth } from "@/lib/auth";

export default async function OrdersPage() {
  // Ensure user is authenticated (fallback check)
  await requireAuth("/orders");
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <HorizontalHeader />
      <main className="flex-1 overflow-y-auto p-6 animate-in fade-in duration-1000">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground animate-in fade-in slide-in-from-left-4 duration-1000 ease-in-out">
            <span className="text-primary transition-colors duration-1000 ease-in-out">
              Orders
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between animate-in fade-in slide-in-from-bottom-4 duration-1000 ease-in-out animate-delay-100">
            <h1 className="text-2xl font-bold transition-colors duration-1000 ease-in-out">
              Orders
            </h1>
            <div className="flex items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="bg-blue-500 hover:bg-blue-600 transition-all duration-1000 ease-in-out hover:scale-105 hover:shadow-md active:scale-95">
                    Settings
                    <ChevronRight className="ml-2 h-4 w-4 rotate-90 transition-transform duration-1000 ease-in-out" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="animate-in fade-in slide-in-from-top-4 duration-1000"
                >
                  <DropdownMenuItem className="transition-colors duration-1000 ease-in-out">
                    Export Orders
                  </DropdownMenuItem>
                  <DropdownMenuItem className="transition-colors duration-1000 ease-in-out">
                    Import Orders
                  </DropdownMenuItem>
                  <DropdownMenuItem className="transition-colors duration-1000 ease-in-out">
                    Settings
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button className="bg-blue-500 hover:bg-blue-600 transition-all duration-1000 ease-in-out hover:scale-105 hover:shadow-md active:scale-95">
                <Plus className="mr-2 h-4 w-4 transition-transform duration-1000 ease-in-out" />
                Add New Order
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className="relative max-w-md animate-in fade-in slide-in-from-bottom-4 duration-1000 ease-in-out animate-delay-200">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors duration-1000 ease-in-out" />
            <Input
              type="search"
              placeholder="Search Order"
              className="pl-10 transition-all duration-1000 ease-in-out focus:scale-[1.02] focus:shadow-md"
            />
          </div>

          {/* Orders Table */}
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000 ease-in-out animate-delay-300">
            <OrdersTable />
          </div>
        </div>
      </main>
    </div>
  );
}
