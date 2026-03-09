'use client';

export type AdminClientItem = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  bookingsCount: number;
  paidTotal: number;
};

export default function AdminClientsPanel({
  initialClients,
}: {
  initialClients: AdminClientItem[];
}) {
  return (
    <div className="space-y-4">
      <div className="overflow-x-auto border rounded-lg">
        <table className="min-w-full text-sm">
          <thead className="bg-muted/50">
            <tr className="text-left">
              <th className="px-3 py-2 font-medium">Client</th>
              <th className="px-3 py-2 font-medium">Email</th>
              <th className="px-3 py-2 font-medium">Inscrit le</th>
              <th className="px-3 py-2 font-medium">Réservations</th>
              <th className="px-3 py-2 font-medium">CA confirmé</th>
            </tr>
          </thead>
          <tbody>
            {initialClients.map((client) => (
              <tr key={client.id} className="border-t">
                <td className="px-3 py-2">{client.name}</td>
                <td className="px-3 py-2">
                  <a href={`mailto:${client.email}`} className="text-gc-green underline underline-offset-2">
                    {client.email}
                  </a>
                </td>
                <td className="px-3 py-2">
                  {new Date(client.createdAt).toLocaleDateString('fr-FR')}
                </td>
                <td className="px-3 py-2">{client.bookingsCount}</td>
                <td className="px-3 py-2">{client.paidTotal.toFixed(0)}€</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
