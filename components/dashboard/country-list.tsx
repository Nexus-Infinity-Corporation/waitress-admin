import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getCountriesData } from "@/services/dashboard.service"

export async function CountryList() {
  const countries = await getCountriesData()
  const totalVisits = countries.reduce((sum, country) => sum + country.visits, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top countries</CardTitle>
        <p className="text-sm text-muted-foreground">
          Total Visits: {totalVisits.toLocaleString()}
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {countries.map((country, index) => (
            <div key={country.name} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-muted-foreground">
                  {index + 1}.
                </span>
                <span className="text-sm font-medium">{country.name}</span>
              </div>
              <span className="text-sm font-semibold">{country.visits}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
