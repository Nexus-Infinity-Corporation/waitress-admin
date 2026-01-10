"use client";

import { DataTable, type ColumnDef } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import type { WarehouseItem } from "@/shared/types/restaurant";

interface WarehouseTableProps {
  data: WarehouseItem[];
}

export function WarehouseTable({ data }: WarehouseTableProps) {
  const columns: ColumnDef<WarehouseItem>[] = [
    {
      key: "productName",
      header: "Product",
      render: (item) => (
        <div>
          <p className="text-sm font-medium">{item.productName}</p>
          <p className="text-xs text-muted-foreground">ID: {item.productId}</p>
        </div>
      ),
    },
    {
      key: "quantity",
      header: "Quantity",
      render: (item) => (
        <div>
          <span className="font-medium">
            {item.quantity} {item.unit}
          </span>
          {item.quantity <= item.minStock && (
            <Badge variant="warning" className="ml-2">
              Low Stock
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: "location",
      header: "Location",
    },
    {
      key: "minStock",
      header: "Min/Max",
      render: (item) => (
        <span className="text-sm">
          {item.minStock} / {item.maxStock}
        </span>
      ),
    },
    {
      key: "supplier",
      header: "Supplier",
    },
    {
      key: "lastRestocked",
      header: "Last Restocked",
    },
    {
      key: "expiryDate",
      header: "Expiry Date",
      render: (item) =>
        item.expiryDate ? (
          <span className="text-sm">{item.expiryDate}</span>
        ) : (
          <span className="text-sm text-muted-foreground">N/A</span>
        ),
    },
  ];

  return (
    <DataTable
      title="Product Warehouse"
      data={data}
      columns={columns}
      searchKey="productName"
      searchPlaceholder="Search warehouse items..."
      onAdd={() => console.log("Add warehouse item")}
      onEdit={(item) => console.log("Edit", item)}
      onDelete={(item) => console.log("Delete", item)}
    />
  );
}
