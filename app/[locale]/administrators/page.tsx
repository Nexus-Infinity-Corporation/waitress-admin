import { HorizontalHeader } from "@/components/dashboard/horizontal-header";
import { NavigationClient } from "@/components/dashboard/navigation-client";
import { AdministratorsTable } from "./components/administrators-table";
import { getAdministrators } from "./services/administrators.service";
import { getNavigationItems } from "@/services/navigation.service";
import { requireRole } from "@/lib/auth";

// Cache this page for 1 hour since it uses mocked data
export const revalidate = 3600;

export default async function AdministratorPage() {
  // Check if user has required role level (>= 9 for administrators)
  // This will redirect to dashboard if user doesn't have sufficient permissions
  const currentUserRole = await requireRole(9, "/dashboard");

  // Fetch data in parallel after auth check
  const [administrators, navItems] = await Promise.all([
    getAdministrators(),
    getNavigationItems(),
  ]);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <HorizontalHeader />
      <main className="flex flex-1 flex-row overflow-hidden">
        <NavigationClient items={navItems} />
        <div className="flex-1 overflow-y-auto p-6 animate-in fade-in duration-1000">
          <div className="mx-auto max-w-7xl">
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000 ease-in-out">
              <AdministratorsTable
                data={administrators}
                currentUserRoleLevel={currentUserRole?.role_level ?? null}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
