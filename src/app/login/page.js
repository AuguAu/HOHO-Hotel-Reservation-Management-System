"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    document.title = "hoho | Login";
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    
    // api check db
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    
    const data = await res.json();

    if (data.success) {
      // save data to local storage
      localStorage.setItem('hoho_admin', JSON.stringify({ 
        ...data.data,
        profile: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.data.username}`
      }));
      router.push('/'); 
    } else {
      alert('Login Failed: ' + data.error);
    }
  };

  //const handleEmergencyReset = async () => {
    //if(!confirm("EMERGENCY OVERRIDE: Clear all data and create default Admin accounts. Proceed?")) return;
    
    //const res = await fetch('/api/reset', { method: 'POST' });
    //if ((await res.json()).success) {
      //alert("Database reset successfully!\n\nYou can now login with:\nUsername: manager\nPassword: manager_pwd");
    //} else {
      //alert("Error resetting database");
    //}
  //};

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 font-sans relative">
      <div className="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-red-100/50 w-full max-w-md text-center border border-red-50">
        <div className="bg-red-600 w-16 h-16 rounded-2xl flex items-center justify-center text-white text-3xl font-black mx-auto mb-4 shadow-lg shadow-red-200">
          H
        </div>
        <h1 className="text-3xl font-black text-red-700 mb-2">hoho</h1>
        <p className="text-slate-400 font-medium mb-8 text-sm">Please sign in to access the system</p>

        <form onSubmit={handleLogin} className="space-y-4 text-left">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Username</label>
            <input 
              type="text" 
              className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl outline-none focus:border-red-500 transition-colors mt-1 text-sm font-bold"
              value={username} onChange={(e) => setUsername(e.target.value)} required
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Password</label>
            <input 
              type="password" 
              className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl outline-none focus:border-red-500 transition-colors mt-1 text-sm font-bold"
              value={password} onChange={(e) => setPassword(e.target.value)} required
            />
          </div>
          <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-4 rounded-2xl mt-4 shadow-lg shadow-red-200 transition-all uppercase text-sm tracking-widest">
            Sign In
          </button>
        </form>
      </div>

      {/* <div onClick={handleEmergencyReset} className="fixed bottom-2 right-2 opacity-20 hover:opacity-100 cursor-pointer p-2 transition-opacity z-50">
        <span className="text-2xl">⚙️</span>
      </div> */}
    </div>
  );
}