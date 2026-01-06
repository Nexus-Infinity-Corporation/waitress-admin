import { HeaderClient } from "./header-client"
import { NavigationClient } from "./navigation-client"
import { getNavigationItems } from "@/services/navigation.service"

export async function HorizontalHeader() {
  const navItems = await getNavigationItems()

  return (
    <div className="flex flex-col border-b border-border bg-card">
      <HeaderClient />
      <NavigationClient items={navItems} />
    </div>
  )
}
