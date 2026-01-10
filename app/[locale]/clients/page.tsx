import { HorizontalHeader } from "@/components/dashboard/horizontal-header";
import { ClientsTable } from "@/components/dashboard/clients-table";
import { getClients } from "@/services/clients.service";

export default async function ClientsPage() {
  const clients = await getClients();

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <HorizontalHeader />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-7xl">
          <ClientsTable data={clients} />
        </div>
      </main>
    </div>
  );
}
