import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MonthlyOrdersChartClient } from "./monthly-orders-chart-client";
import { getMonthlyOrdersData } from "@/app/[locale]/dashboard/services/dashboard.service";

export async function MonthlyOrdersChart() {
  const data = await getMonthlyOrdersData();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Orders</CardTitle>
      </CardHeader>
      <CardContent>
        <MonthlyOrdersChartClient data={data} />
      </CardContent>
    </Card>
  );
}
