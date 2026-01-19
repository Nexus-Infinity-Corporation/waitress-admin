import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OrdersTableClient } from "./orders-table-client";
import { getOrders } from "../../dashboard/services/dashboard.service";

export async function OrdersTable() {
  const orders = await getOrders();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Orders</CardTitle>
      </CardHeader>
      <CardContent>
        <OrdersTableClient orders={orders} />
      </CardContent>
    </Card>
  );
}
