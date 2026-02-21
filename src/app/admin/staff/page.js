"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function StaffPage() {
  const router = useRouter();
  const [admin, setAdmin] = useState(null);
  const [staffList, setStaffList] = useState([]);
  const [formData, setFormData] = useState({ username: '', password: '', name: '', role: 'Receptionist' });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('hoho_admin'));
    if (!user || user.role !== 'Manager') {
      alert("Access Denied: Only Managers can access this page.");
      router.push('/');
      return;
    }
    setAdmin(user);
    fetchStaff();
  }, [router]);

  const fetchStaff = async () => {
    const res = await fetch('/api/users');
    const data = await res.json();
    if (data.success) setStaffList(data.data);
  };

  const handleAddStaff = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    if ((await res.json()).success) {
      alert("Staff Added Successfully!");
      setFormData({ username: '', password: '', name: '', role: 'Receptionist' });
      fetchStaff();
    } else {
      alert("Error: Username might already exist.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('hoho_admin');
    router.push('/admin/login');
  };

  if (!admin) return <div className="min-h-screen bg-[#FFF0F0]"></div>;

  return (
    <div className="min-h-screen bg-[#FFF0F0] font-sans pb-12">
      <nav className="bg-white/90 backdrop-blur-md border-b border-red-100 sticky top-0 z-40 px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-xl font-black text-slate-800 hover:text-red-600 transition-colors">← Home</Link>
          <span className="w-px h-6 bg-slate-200"></span>
          <span className="text-xl font-black text-red-700">hoho. Staff Management</span>
        </div>
        <div className="flex items-center gap-4 text-sm font-bold">
          <span className="bg-red-50 text-red-800 px-3 py-1.5 rounded-full border border-red-100">{admin.name} ({admin.role})</span>
          <button onClick={handleLogout} className="bg-slate-900 text-white px-4 py-2.5 rounded-xl hover:bg-slate-800 transition-colors">Logout</button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto p-6 mt-6 space-y-8">
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-red-50">
          <h2 className="text-xl font-black text-slate-800 mb-6">➕ Add New Staff</h2>
          <form onSubmit={handleAddStaff} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" placeholder="Full Name" required className="bg-slate-50 border p-3 rounded-xl outline-red-400 text-sm" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            <select className="bg-slate-50 border p-3 rounded-xl outline-red-400 text-sm" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
              <option value="Receptionist">Receptionist</option>
              <option value="Manager">Manager</option>
            </select>
            <input type="text" placeholder="Username" required className="bg-slate-50 border p-3 rounded-xl outline-red-400 text-sm" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} />
            <input type="password" placeholder="Password" required className="bg-slate-50 border p-3 rounded-xl outline-red-400 text-sm" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
            <button type="submit" className="md:col-span-2 bg-emerald-500 hover:bg-emerald-600 text-white font-black py-3 rounded-xl shadow-lg shadow-emerald-200 transition-all uppercase text-sm">Create Account</button>
          </form>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-red-50">
          <h2 className="text-xl font-black text-slate-800 mb-6">👥 Current Staff</h2>
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                <th className="pb-4">Name</th>
                <th className="pb-4">Username</th>
                <th className="pb-4">Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {staffList.map(staff => (
                <tr key={staff._id}>
                  <td className="py-4 font-bold text-slate-800">{staff.name}</td>
                  <td className="py-4 text-sm font-medium text-slate-500">{staff.username}</td>
                  <td className="py-4">
                    <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase ${staff.role === 'Manager' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>{staff.role}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}