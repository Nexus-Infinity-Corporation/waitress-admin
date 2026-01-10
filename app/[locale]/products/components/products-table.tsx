"use client";

import { DataTable, type ColumnDef } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@/shared/types/restaurant";

interface ProductsTableProps {
  data: Product[];
}

export function ProductsTable({ data }: ProductsTableProps) {
  const columns: ColumnDef<Product>[] = [
    {
      key: "name",
      header: "Product",
      render: (product) => (
        <div>
          <p className="text-sm font-medium">{product.name}</p>
          <p className="text-xs text-muted-foreground">{product.sku}</p>
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
    },
    {
      key: "price",
      header: "Price",
      render: (product) => <span className="font-medium">{product.price}</span>,
    },
    {
      key: "cost",
      header: "Cost",
    },
    {
      key: "status",
      header: "Status",
      render: (product) => (
        <Badge
          variant={
            product.status === "Available"
              ? "success"
              : product.status === "Out of Stock"
                ? "warning"
                : "destructive"
          }
        >
          {product.status}
        </Badge>
      ),
    },
  ];

  return (
    <DataTable
      title="Restaurant Products"
      data={data}
      columns={columns}
      searchKey="name"
      searchPlaceholder="Search products..."
      onAdd={() => console.log("Add product")}
      onEdit={(product) => console.log("Edit", product)}
      onDelete={(product) => console.log("Delete", product)}
    />
  );
}
