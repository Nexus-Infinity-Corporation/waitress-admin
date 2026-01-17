import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LeadsTableClient } from "./leads-table-client";
import { getOrders } from "@/app/[locale]/dashboard/services/dashboard.service";

export async function LeadsTable() {
  const leads = await getOrders();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Potential Leads</CardTitle>
      </CardHeader>
      <CardContent>
        <LeadsTableClient leads={leads} />
      </CardContent>
    </Card>
  );
}
