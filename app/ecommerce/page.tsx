import { HorizontalHeader } from "@/components/dashboard/horizontal-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Plus, ChevronRight } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { OrdersTable } from "@/components/dashboard/orders-table"

export default function OrdersPage() {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <HorizontalHeader />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="text-primary">eCommerce</span>
            <ChevronRight className="h-4 w-4" />
            <span>Orders</span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Orders</h1>
            <div className="flex items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="bg-blue-500 hover:bg-blue-600">
                    Settings
                    <ChevronRight className="ml-2 h-4 w-4 rotate-90" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Export Orders</DropdownMenuItem>
                  <DropdownMenuItem>Import Orders</DropdownMenuItem>
                  <DropdownMenuItem>Settings</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button className="bg-blue-500 hover:bg-blue-600">
                <Plus className="mr-2 h-4 w-4" />
                Add New Order
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search Order"
              className="pl-10"
            />
          </div>

          {/* Orders Table */}
          <OrdersTable />
        </div>
      </main>
    </div>
  )
}
