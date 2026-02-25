"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

export default function DashboardPage() {
  const router = useRouter();
  const [admin, setAdmin] = useState(null);
  const [stats, setStats] = useState({ popular: [], occupancy: [] });
  const [stayStats, setStayStats] = useState([]); // for bar chart

  const COLORS = ['#F59E0B', '#10B981', '#3B82F6'];

  useEffect(() => {
    document.title = "hoho | Dashboard";
    const user = localStorage.getItem('hoho_admin');
    if (!user) {
      router.push('/login');
      return;
    }
    setAdmin(JSON.parse(user));

    fetch('/api/stats').then(res => res.json()).then(data => {
      if (data.success) setStats(data);
    });

    fetch('/api/bookings').then(res => res.json()).then(data => {
      if (data.success) {
        // calculate how many nights the customer stays to make a Bar Chart
        const stayCounts = { '1 Night': 0, '2 Nights': 0, '3 Nights': 0, '4+ Nights': 0 };
        data.data.forEach(b => {
          const inD = new Date(b.checkIn);
          const outD = new Date(b.checkOut);
          const diffDays = Math.ceil(Math.abs(outD - inD) / (1000 * 60 * 60 * 24)) || 1;
          
          if (diffDays === 1) stayCounts['1 Night']++;
          else if (diffDays === 2) stayCounts['2 Nights']++;
          else if (diffDays === 3) stayCounts['3 Nights']++;
          else stayCounts['4+ Nights']++;
        });
        
        const chartData = Object.keys(stayCounts).map(key => ({ name: key, Guests: stayCounts[key] }));
        setStayStats(chartData);
      }
    });
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('hoho_admin');
    router.push('/');
  };

  if (!admin) return <div className="min-h-screen"></div>;

  return (
    <div className="min-h-screen font-sans pb-12">
      <nav className="bg-white/90 backdrop-blur-md border-b border-red-100 sticky top-0 z-40 shadow-sm px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Link href="/" className="bg-red-600 w-10 h-10 rounded-xl text-white font-black text-xl flex items-center justify-center shadow-md">
            H
          </Link>
          <Link href="/" className="text-2xl font-black text-red-700 tracking-tighter">hoho</Link>
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
          <button onClick={() => { localStorage.removeItem('hoho_admin'); router.push('/login'); }} className="bg-slate-900 text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-slate-800 transition-colors">
            Logout
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6 mt-6 space-y-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Occupancy */}
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
                    <div className="h-full bg-blue-500 rounded-full transition-all duration-1000" style={{ width: `${(item.occupied / item.total) * 100}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Popular Rooms */}
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-red-50">
            <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
              <span className="bg-amber-100 text-amber-600 p-2 rounded-lg text-sm">🏆</span> Top Popular Rooms
            </h2>
            <div className="h-64 w-full">
              {stats.popular.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={stats.popular} dataKey="count" nameKey="_id" cx="50%" cy="50%" outerRadius={80} innerRadius={50} paddingAngle={5} label={({ _id, count }) => `${_id} (${count})`}>
                      {stats.popular.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : <div className="h-full flex items-center justify-center text-slate-400 font-bold">No Data Available</div>}
            </div>
          </div>
        </div>

        {/* Length of Stay in bar graph */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-red-50">
          <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
            <span className="bg-purple-100 text-purple-600 p-2 rounded-lg text-sm">🌙</span> Guest Length of Stay
          </h2>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stayStats} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 'bold'}} />
                <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 'bold'}} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}/>
                <Bar dataKey="Guests" fill="#8b5cf6" radius={[8, 8, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </main>
    </div>
  );
}