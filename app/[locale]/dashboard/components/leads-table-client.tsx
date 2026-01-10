"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { Order } from "../types/dashboard";

interface LeadsTableClientProps {
  leads: Order[];
}

function getStatusVariant(status: string) {
  switch (status) {
    case "Completed":
    case "FULFILLED":
      return "success";
    case "In Progress":
    case "CONFIRMED":
      return "default";
    case "Cancelled":
    case "PARTIALLY SHIPPED":
      return "warning";
    default:
      return "outline";
  }
}

export function LeadsTableClient({ leads }: LeadsTableClientProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
              Lead
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
              Deposit
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
              Progress
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
              Last Update
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
              Status
            </th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr key={lead.id} className="border-b hover:bg-muted/50">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>
                      {lead.company.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{lead.company}</p>
                    <p className="text-xs text-muted-foreground">
                      Lead Designers
                    </p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3">
                <span className="text-sm font-medium">{lead.total}</span>
              </td>
              <td className="px-4 py-3">
                <div className="h-2 w-24 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full bg-primary"
                    style={{
                      width: `${
                        lead.status === "FULFILLED"
                          ? 100
                          : lead.status === "CONFIRMED"
                            ? 60
                            : 0
                      }%`,
                    }}
                  />
                </div>
              </td>
              <td className="px-4 py-3">
                <span className="text-sm text-muted-foreground">
                  {lead.date}
                </span>
              </td>
              <td className="px-4 py-3">
                <Badge
                  variant={
                    getStatusVariant(lead.status) as
                      | "default"
                      | "secondary"
                      | "destructive"
                      | "outline"
                      | "success"
                      | "warning"
                  }
                >
                  {lead.status}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
