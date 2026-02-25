"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function StaffPage() {
  const router = useRouter();
  const [admin, setAdmin] = useState(null);
  const [staffList, setStaffList] = useState([]);
  const [formData, setFormData] = useState({ username: '', password: '', name: '', role: 'Receptionist' });
  
  const [showPassword, setShowPassword] = useState(false);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    document.title = "hoho | Manage Staff";
    const user = JSON.parse(localStorage.getItem('hoho_admin'));
    if (!user || user.role !== 'Manager') {
      alert("Access Denied: Only Managers can access this page.");
      router.push('/'); return;
    }
    setAdmin(user);
    fetchStaff();
  }, [router]);

  const fetchStaff = async () => {
    const res = await fetch('/api/users');
    const data = await res.json();
    if (data.success) setStaffList(data.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editId) {
      // update
      const res = await fetch(`/api/users/${editId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData)
      });
      if ((await res.json()).success) {
        alert("Staff Updated Successfully!");
        setEditId(null);
      }
    } else {
      // create
      const res = await fetch('/api/users', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData)
      });
      if ((await res.json()).success) alert("Staff Added Successfully!");
      else alert("Error: Username might already exist.");
    }
    setFormData({ username: '', password: '', name: '', role: 'Receptionist' });
    fetchStaff();
  };

  const handleEdit = (staff) => {
    setEditId(staff._id);
    setFormData({ username: staff.username, password: '', name: staff.name, role: staff.role });
  };

  const handleDelete = async (id) => {
    if(!confirm("Are you sure you want to remove this staff?")) return;
    await fetch(`/api/users/${id}`, { method: 'DELETE' });
    fetchStaff();
  };

  const handleLogout = () => {
    localStorage.removeItem('hoho_admin');
    router.push('/login');
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

      <main className="max-w-4xl mx-auto p-6 mt-6 space-y-8">
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-red-50">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-black text-slate-800">{editId ? '✏️ Edit Staff' : '➕ Add New Staff'}</h2>
            {editId && <button onClick={() => { setEditId(null); setFormData({ username: '', password: '', name: '', role: 'Receptionist' }); }} className="text-xs font-bold text-slate-400 hover:text-red-500">Cancel Edit ✕</button>}
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" placeholder="Full Name" required className="bg-slate-50 border p-3 rounded-xl outline-red-400 text-sm" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            <select className="bg-slate-50 border p-3 rounded-xl outline-red-400 text-sm" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
              <option value="Receptionist">Receptionist</option>
              <option value="Manager">Manager</option>
            </select>
            <input type="text" placeholder="Username" required disabled={editId} className="bg-slate-50 border p-3 rounded-xl outline-red-400 text-sm disabled:opacity-50" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} />
            
            <div className="relative">
              <input type={showPassword ? "text" : "password"} placeholder={editId ? "New Password (leave blank to keep current)" : "Password"} required={!editId} className="w-full bg-slate-50 border p-3 rounded-xl outline-red-400 text-sm" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600 transition-colors">
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>

            <button type="submit" className={`md:col-span-2 text-white font-black py-3 rounded-xl shadow-lg transition-all uppercase text-sm ${editId ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-200' : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200'}`}>
              {editId ? 'Update Account' : 'Create Account'}
            </button>
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
                <th className="pb-4 text-right">Actions</th>
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
                  <td className="py-4 text-right space-x-2">
                    {staff.username !== admin.username && (
                      <>
                        <button onClick={() => handleEdit(staff)} className="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg hover:bg-amber-100">Edit</button>
                        <button onClick={() => handleDelete(staff._id)} className="text-xs font-bold text-red-600 bg-red-50 px-3 py-1.5 rounded-lg hover:bg-red-100">Delete</button>
                      </>
                    )}
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