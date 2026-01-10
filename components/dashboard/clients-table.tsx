"use client";

import { DataTable, type ColumnDef } from "./data-table";
import { Badge } from "@/components/ui/badge";
import type { RestaurantClient } from "@/types/restaurant";

interface ClientsTableProps {
  data: RestaurantClient[];
}

export function ClientsTable({ data }: ClientsTableProps) {
  const columns: ColumnDef<RestaurantClient>[] = [
    {
      key: "restaurantName",
      header: "Restaurant",
      render: (client) => (
        <div>
          <p className="text-sm font-medium">{client.restaurantName}</p>
          <p className="text-xs text-muted-foreground">{client.name}</p>
        </div>
      ),
    },
    {
      key: "email",
      header: "Email",
    },
    {
      key: "phone",
      header: "Phone",
    },
    {
      key: "city",
      header: "Location",
      render: (client) => (
        <div>
          <p className="text-sm">{client.city}</p>
          <p className="text-xs text-muted-foreground">{client.address}</p>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (client) => (
        <Badge
          variant={
            client.status === "Active"
              ? "success"
              : client.status === "Suspended"
                ? "warning"
                : "destructive"
          }
        >
          {client.status}
        </Badge>
      ),
    },
    {
      key: "totalOrders",
      header: "Orders",
    },
    {
      key: "totalSpent",
      header: "Total Spent",
    },
  ];

  return (
    <DataTable
      title="Restaurant Clients"
      data={data}
      columns={columns}
      searchKey="restaurantName"
      searchPlaceholder="Search restaurants..."
      onAdd={() => console.log("Add client")}
      onEdit={(client) => console.log("Edit", client)}
      onDelete={(client) => console.log("Delete", client)}
    />
  );
}
