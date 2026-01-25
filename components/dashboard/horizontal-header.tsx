import { HeaderClient } from "./header-client";
import { NavigationClient } from "./navigation-client";
import { getNavigationItems } from "@/app/[locale]/dashboard/services/navigation.service";

export async function HorizontalHeader() {
  const navItems = await getNavigationItems();

  return (
    <div className="flex flex-col border-b border-border bg-card">
      <HeaderClient />
    </div>
  );
}
