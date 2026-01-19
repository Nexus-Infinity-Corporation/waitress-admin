import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getBrowserStatsData } from "@/app/[locale]/dashboard/services/dashboard.service";

export async function BrowserStats() {
  const browsers = await getBrowserStatsData();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Browser Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {browsers.map((browser) => (
            <div key={browser.name} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{browser.name}</span>
                <span className="font-semibold">{browser.percentage}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className={`h-full ${browser.color} transition-all duration-1000 ease-in-out`}
                  style={{ width: `${browser.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
