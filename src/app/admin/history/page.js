"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function HistoryPage() {
  const router = useRouter();
  const [admin, setAdmin] = useState(null);
  const [bookings, setBookings] = useState([]);
  
  // Search & Filter
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    const user = localStorage.getItem('hoho_admin');
    if (!user) {
      router.push('/admin/login');
      return;
    }
    setAdmin(JSON.parse(user));

    fetch('/api/bookings').then(res => res.json()).then(data => {
      if (data.success) setBookings(data.data);
    });
  }, [router]);

  const filteredBookings = bookings.filter(b => {
    const searchStr = search.toLowerCase();
    const matchSearch = b.customerName.toLowerCase().includes(searchStr) || (b.roomID?.roomNumber || '').toLowerCase().includes(searchStr);
    const matchStatus = filterStatus ? b.status === filterStatus : true;
    return matchSearch && matchStatus;
  });

  if (!admin) return <div className="min-h-screen bg-[#FFF0F0]"></div>;

  return (
    <div className="min-h-screen bg-[#FFF0F0] font-sans pb-12">
      <nav className="bg-white/90 backdrop-blur-md border-b border-red-100 sticky top-0 z-40 shadow-sm px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Link href="/" className="bg-red-600 w-10 h-10 rounded-xl text-white font-black text-xl flex items-center justify-center shadow-md">
            H
          </Link>
          <Link href="/" className="text-2xl font-black text-red-700 tracking-tighter">HOHO</Link>
        </div>
        <div className="flex items-center gap-4 text-sm font-bold">
          <Link href="/" className="text-slate-500 hover:text-red-600 transition-colors">Room Available</Link>
          <Link href="/admin/dashboard" className="text-slate-500 hover:text-red-600 transition-colors">Dashboard</Link>
          <Link href="/admin/history" className="text-slate-500 hover:text-red-600 transition-colors">History Log</Link>
          {admin.role === 'Manager' && <Link href="/admin/staff" className="text-slate-500 hover:text-red-600 transition-colors">Manage Staff</Link>}

          <div className="w-px h-5 bg-slate-200 mx-1"></div>
          
          <div className="flex items-center gap-2 bg-red-50 px-3 py-1.5 rounded-full border border-red-100">
             <span className="text-xs font-bold text-red-800">{admin.name} ({admin.role})</span>
             <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          </div>
          <button onClick={() => { localStorage.removeItem('hoho_admin'); router.push('/admin/login'); }} className="bg-slate-900 text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-slate-800 transition-colors">
            Logout
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6 mt-6">
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-red-50 overflow-hidden">
          
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
              <span className="bg-emerald-100 text-emerald-600 p-2 rounded-lg text-sm">👥</span> Customer Bookings Log
            </h2>
            <div className="flex gap-2">
              <input type="text" placeholder="🔍 Search Name or Room..." className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-sm outline-red-400 w-56" value={search} onChange={e => setSearch(e.target.value)} />
              <select className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-sm outline-red-400" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                <option value="">All Status</option>
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

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
                {filteredBookings.map(b => (
                  <tr key={b._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4">
                      <p className="font-bold text-slate-800">{b.customerName}</p>
                      <p className="text-[10px] text-slate-400 font-bold">📞 {b.phone} | 🎫 {b.idCard}</p>
                    </td>
                    <td className="py-4 text-sm font-black text-indigo-600">{b.roomID?.roomNumber || 'N/A'}</td>
                    <td className="py-4 text-xs font-medium text-slate-500">
                      <div>{b.actualCheckInTime ? new Date(b.actualCheckInTime).toLocaleString('en-US') : 'N/A'}</div>
                      {b.checkInBy && <div className="text-[9px] text-amber-600 font-bold mt-1 uppercase">BY: {b.checkInBy}</div>}
                    </td>
                    <td className="py-4 text-xs font-medium text-slate-500">
                      <div>{b.actualCheckOutTime ? new Date(b.actualCheckOutTime).toLocaleString('en-US') : '-'}</div>
                      {b.checkOutBy && <div className="text-[9px] text-red-600 font-bold mt-1 uppercase">BY: {b.checkOutBy}</div>}
                    </td>
                    <td className="py-4 text-right">
                      <span className={`font-bold text-[10px] px-3 py-1.5 rounded-full uppercase tracking-widest ${
                        b.status === 'Completed' ? 'bg-slate-100 text-slate-500' : 'bg-emerald-50 text-emerald-600'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {filteredBookings.length === 0 && (
                  <tr><td colSpan="5" className="py-8 text-center text-slate-400 font-bold">No records found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}