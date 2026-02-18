"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
// Import Recharts to make pie chart
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function DashboardPage() {
  const router = useRouter();
  const [admin, setAdmin] = useState(null);
  const [stats, setStats] = useState({ popular: [], occupancy: [] });
  const [bookings, setBookings] = useState([]);

  // Colors for Pie Chart
  const COLORS = ['#F59E0B', '#10B981', '#3B82F6'];

  useEffect(() => {
    const user = localStorage.getItem('hoho_admin');
    if (!user) {
      router.push('/admin/login');
      return;
    }
    setAdmin(JSON.parse(user));

    fetch('/api/stats').then(res => res.json()).then(data => {
      if (data.success) setStats(data);
    });

    fetch('/api/bookings').then(res => res.json()).then(data => {
      if (data.success) setBookings(data.data);
    });
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('hoho_admin');
    router.push('/');
  };

  if (!admin) return <div className="min-h-screen bg-[#FFF0F0] flex justify-center items-center font-bold text-red-500">Loading Dashboard...</div>;

  return (
    <div className="min-h-screen bg-[#FFF0F0] font-sans pb-12">
      <nav className="bg-white/90 backdrop-blur-md border-b border-red-100 sticky top-0 z-40 px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-xl font-black text-slate-800 hover:text-red-600 transition-colors">← Home</Link>
          <span className="w-px h-6 bg-slate-200"></span>
          <span className="text-xl font-black text-red-700">hoho. Analytics</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-red-50 pr-4 pl-1 py-1 rounded-full border border-red-100">
             <img src={admin.profile} alt="Admin" className="w-8 h-8 rounded-full bg-red-200" />
             <div className="flex flex-col">
               <span className="text-[10px] font-black text-red-800 uppercase leading-none mt-1">{admin.role}</span>
               <span className="text-xs font-bold text-slate-600 leading-none">{admin.username}</span>
             </div>
          </div>
          <button onClick={handleLogout} className="bg-slate-900 text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-slate-800 transition-colors">
            Logout
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6 mt-6 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Real-time Occupancy */}
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-red-50">
            <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
              <span className="bg-blue-100 text-blue-600 p-2 rounded-lg text-sm">📊</span> Real-time Occupancy
            </h2>
            <div className="space-y-6">
              {stats.occupancy.map(item => (
                <div key={item._id}>
                  <div className="flex justify-between text-sm font-bold text-slate-600 mb-2 uppercase">
                    <span>{item._id} Room</span>
                    <span className="text-blue-600">{item.occupied} / {item.total} Occupied</span>
                  </div>
                  <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full transition-all duration-1000"
                      style={{ width: `${(item.occupied / item.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top 3 Popular Rooms (Pie Chart) */}
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-red-50">
            <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
              <span className="bg-amber-100 text-amber-600 p-2 rounded-lg text-sm">🏆</span> Top 3 Popular Rooms
            </h2>
            <div className="h-64 w-full">
              {stats.popular.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.popular}
                      dataKey="count"
                      nameKey="_id"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      innerRadius={50}
                      fill="#8884d8"
                      paddingAngle={5}
                      label={({ _id, count }) => `${_id} (${count})`}
                    >
                      {stats.popular.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 font-bold">No Data Available</div>
              )}
            </div>
          </div>
        </div>

        {/* Customer Bookings Log */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-red-50 overflow-hidden">
          <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
            <span className="bg-emerald-100 text-emerald-600 p-2 rounded-lg text-sm">👥</span> Customer Bookings Log
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                  <th className="pb-4">Customer Details</th>
                  <th className="pb-4">Room</th>
                  <th className="pb-4">Actual Check-in Time</th>
                  <th className="pb-4">Actual Check-out Time</th>
                  <th className="pb-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {bookings.map(b => (
                  <tr key={b._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4">
                      <p className="font-bold text-slate-800">{b.customerName}</p>
                      <p className="text-[10px] text-slate-400 font-bold">📞 {b.phone} | 🎫 {b.idCard}</p>
                    </td>
                    <td className="py-4 text-sm font-black text-indigo-600">{b.roomID?.roomNumber || 'N/A'}</td>
                    <td className="py-4 text-xs font-medium text-slate-500">
                      {b.actualCheckInTime ? new Date(b.actualCheckInTime).toLocaleString('th-TH') : 'N/A'}
                    </td>
                    <td className="py-4 text-xs font-medium text-slate-500">
                      {/* If checkout time is available, show it. Otherwise, show a dash (-). */}
                      {b.actualCheckOutTime ? new Date(b.actualCheckOutTime).toLocaleString('th-TH') : '-'}
                    </td>
                    <td className="py-4 text-right">
                      {/* Change the color of the status label according to the actual status */}
                      <span className={`font-bold text-[10px] px-3 py-1.5 rounded-full uppercase tracking-widest ${
                        b.status === 'Completed' ? 'bg-slate-100 text-slate-500' : 'bg-emerald-50 text-emerald-600'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {bookings.length === 0 && (
                  <tr><td colSpan="5" className="py-8 text-center text-slate-400 font-bold">No bookings found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}