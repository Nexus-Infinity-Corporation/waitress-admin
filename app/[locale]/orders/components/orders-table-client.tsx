"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import type { Order } from "@/types/dashboard";

interface OrdersTableClientProps {
  orders: Order[];
}

export function OrdersTableClient({ orders }: OrdersTableClientProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="px-6 py-4 text-left">
              <input type="checkbox" className="rounded border-input" />
            </th>
            <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
              Order#
            </th>
            <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
              Company Name
            </th>
            <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
              Status
            </th>
            <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
              Total
            </th>
            <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
              Date
            </th>
            <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
              View Details
            </th>
            <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr
              key={order.id}
              className="border-b hover:bg-muted/50 transition-colors"
            >
              <td className="px-6 py-4">
                <input type="checkbox" className="rounded border-input" />
              </td>
              <td className="px-6 py-4">
                <span className="font-medium">#{order.id}</span>
              </td>
              <td className="px-6 py-4">{order.company}</td>
              <td className="px-6 py-4">
                <Badge
                  variant={
                    order.statusColor as "success" | "default" | "warning"
                  }
                  className="flex items-center gap-1.5 w-fit"
                >
                  <span
                    className={`h-2 w-2 rounded-full ${
                      order.statusColor === "success"
                        ? "bg-green-500"
                        : order.statusColor === "warning"
                          ? "bg-orange-500"
                          : "bg-blue-500"
                    }`}
                  />
                  {order.status}
                </Badge>
              </td>
              <td className="px-6 py-4 font-medium">{order.total}</td>
              <td className="px-6 py-4 text-muted-foreground">{order.date}</td>
              <td className="px-6 py-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-blue-500 hover:text-blue-600"
                >
                  View Details
                </Button>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
