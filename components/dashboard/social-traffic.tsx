import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSocialTrafficData } from "@/app/[locale]/dashboard/services/dashboard.service";

export async function SocialTraffic() {
  const socialData = await getSocialTrafficData();
  const totalVisits = socialData.reduce((sum, item) => sum + item.visits, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Social Traffic</CardTitle>
        <p className="text-3xl font-bold">{totalVisits.toLocaleString()}</p>
        <p className="text-sm text-muted-foreground">Total Visits</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {socialData.map((item) => (
            <div key={item.platform} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{item.platform}</span>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">
                    {item.visits} Visits
                  </span>
                  <span className="font-semibold">{item.percentage}%</span>
                </div>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full bg-primary transition-all duration-1000 ease-in-out"
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
