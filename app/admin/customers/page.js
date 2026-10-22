import { getOrders, getAllUsers } from '@/lib/db';
import { formatDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function AdminCustomersPage() {
  const [users, allOrders] = await Promise.all([
    getAllUsers(),
    getOrders(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Customer Accounts
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Registered buyer profiles, contact records, and lifetime activity.
        </p>
      </div>

      <div className="bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 bg-slate-900/40">
              <tr>
                <th className="p-4">Customer Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Phone</th>
                <th className="p-4">Role</th>
                <th className="p-4">Orders Placed</th>
                <th className="p-4 text-right">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {users.map((u) => {
                const customerOrders = allOrders.filter((o) => o.userId === u.id || o.customerEmail === u.email);
                return (
                  <tr key={u.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="p-4 font-bold text-white flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-blue-600/30 text-blue-400 flex items-center justify-center text-xs font-bold">
                        {u.name.charAt(0)}
                      </div>
                      {u.name}
                    </td>
                    <td className="p-4 font-mono text-slate-400 text-xs">{u.email}</td>
                    <td className="p-4 text-slate-400">{u.phone || '—'}</td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          u.role === 'ADMIN'
                            ? 'bg-purple-500/20 text-purple-400'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4 font-semibold text-white">
                      {customerOrders.length} orders
                    </td>
                    <td className="p-4 text-right text-slate-400 text-xs">
                      {formatDate(u.createdAt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
