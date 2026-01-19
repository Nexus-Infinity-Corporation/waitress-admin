import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SalesChartClient } from "./sales-chart-client";
import { getSalesData } from "../services/dashboard.service";

export async function SalesChart() {
  const data = await getSalesData();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sales Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <SalesChartClient data={data} />
      </CardContent>
    </Card>
  );
}
