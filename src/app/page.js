"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();
  const [admin, setAdmin] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [activeBookings, setActiveBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authChecking, setAuthChecking] = useState(true);
  
  const [search, setSearch] = useState('');
  const [filterFloor, setFilterFloor] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [bookingData, setBookingData] = useState({ customerName: '', idCard: '', phone: '', checkIn: '', checkOut: '' });
  const [currentBooking, setCurrentBooking] = useState(null);

  // Get Today's date in YYYY-MM-DD format for input restriction
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const user = localStorage.getItem('hoho_admin');
    if (!user) {
      router.push('/admin/login');
    } else {
      setAdmin(JSON.parse(user));
      setAuthChecking(false);
      fetchData();
    }
  }, [router]);

  const fetchData = async () => {
    try {
      const resRooms = await fetch('/api/rooms');
      const dataRooms = await resRooms.json();
      if (dataRooms.success) setRooms(dataRooms.data.sort((a, b) => a.roomNumber.localeCompare(b.roomNumber)));

      const resBookings = await fetch('/api/bookings');
      const dataBookings = await resBookings.json();
      if (dataBookings.success) {
        setActiveBookings(dataBookings.data.filter(b => b.status === 'Active'));
      }
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  //const generate75Rooms = async () => {
    // if(!confirm("SYSTEM OVERRIDE: All data will be erased and 75 rooms will be generated. Confirm?")) return;
    // setLoading(true);
    // const res = await fetch('/api/reset', { method: 'POST' });
    // if ((await res.json()).success) {
    //   alert("System has been successfully reset!");
    //   fetchData();
    // }
    // setLoading(false);
  //};

  const handleLogout = () => {
    localStorage.removeItem('hoho_admin');
    router.push('/admin/login');
  };

  const handleRoomClick = (room) => {
    setSelectedRoom(room);
    setIsModalOpen(true);
    setIsEditing(false);
    setBookingData({ customerName: '', idCard: '', phone: '', checkIn: '', checkOut: '' });
    
    if (room.status === 'Occupied') {
      const booking = activeBookings.find(b => b.roomID?._id === room._id);
      setCurrentBooking(booking || null);
      if (booking) {
        setBookingData({ customerName: booking.customerName, idCard: booking.idCard, phone: booking.phone, checkIn: booking.checkIn, checkOut: booking.checkOut });
      }
    } else {
      setCurrentBooking(null);
    }
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    
    // Date Validations
    if (bookingData.checkIn < today && !isEditing) {
      return alert("Error: Check-in date cannot be in the past.");
    }
    if (bookingData.checkOut <= bookingData.checkIn) {
      return alert("Error: Check-out date must be after Check-in date.");
    }

    if (currentBooking && isEditing) {
      const res = await fetch(`/api/bookings/${currentBooking._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'edit', ...bookingData }),
      });
      if ((await res.json()).success) {
        alert("Guest information updated successfully!");
        setIsModalOpen(false);
        fetchData();
      }
    } else {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...bookingData, roomID: selectedRoom._id, checkInBy: admin.name }),
      });
      if ((await res.json()).success) {
        alert("Check-in successfully!");
        setIsModalOpen(false);
        fetchData();
      }
    }
  };

  const handleCheckout = async () => {
    if(!currentBooking) return;
    if(!confirm(`Are you sure you want to check out Room ${selectedRoom.roomNumber}?`)) return;
    
    const res = await fetch(`/api/bookings/${currentBooking._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'checkout', roomID: selectedRoom._id, checkOutBy: admin.name })
    });
    
    if ((await res.json()).success) {
      alert(`Room ${selectedRoom.roomNumber} has been checked out successfully!`);
      setIsModalOpen(false);
      fetchData(); 
    }
  };

  const filteredRooms = rooms.filter(r => {
    const booking = activeBookings.find(b => b.roomID?._id === r._id);
    const searchStr = search.toLowerCase();
    const matchSearch = r.roomNumber.toLowerCase().includes(searchStr) || (booking && booking.customerName.toLowerCase().includes(searchStr));
    const matchFloor = filterFloor ? r.floor.toString() === filterFloor : true;
    const matchType = filterType ? r.type === filterType : true;
    const matchStatus = filterStatus ? r.status === filterStatus : true;
    return matchSearch && matchFloor && matchType && matchStatus;
  });

  if (authChecking || !admin) return <div className="min-h-screen flex items-center justify-center font-bold text-red-500">Checking Authorization...</div>;

  return (
    <div className="min-h-screen font-sans pb-10 relative">
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

      <main className="max-w-7xl mx-auto p-6 mt-4">
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-red-50 mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-800">Room Available</h1>
            <p className="text-red-500 font-medium text-xs mt-1">Check room availability and Check-in / Check-out guest</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <input type="text" placeholder="🔍 Search Room or Guest..." className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-sm outline-red-400 w-48" value={search} onChange={e => setSearch(e.target.value)} />
            <select className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-sm outline-red-400" value={filterFloor} onChange={e => setFilterFloor(e.target.value)}>
              <option value="">All Floors</option>
              {[1,2,3,4,5].map(f => <option key={f} value={f}>Floor {f}</option>)}
            </select>
            <select className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-sm outline-red-400" value={filterType} onChange={e => setFilterType(e.target.value)}>
              <option value="">All Types</option>
              <option value="Single">👤 Single</option>
              <option value="Double">👥 Double</option>
              <option value="Suite">👑 Suite</option>
            </select>
            <select className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-sm outline-red-400" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="">All Status</option>
              <option value="Available">Available (Green)</option>
              <option value="Occupied">Occupied (Red)</option>
            </select>
          </div>
        </div>

        <div className="space-y-6">
          {[5, 4, 3, 2, 1].map(floor => {
            const floorRooms = filteredRooms.filter(r => r.floor === floor);
            if (floorRooms.length === 0) return null;
            return (
              <div key={floor} className="bg-white p-6 rounded-[2rem] shadow-sm border border-red-50">
                <h3 className="text-lg font-black text-red-800 mb-4 flex items-center gap-2">
                  <span className="w-2 h-6 bg-red-500 rounded-full"></span> Floor {floor}
                </h3>
                <div className="grid grid-cols-5 md:grid-cols-10 lg:grid-cols-15 gap-3">
                  {floorRooms.map(room => (
                    <div 
                      key={room._id} onClick={() => handleRoomClick(room)}
                      className={`cursor-pointer h-20 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all hover:scale-105 shadow-sm border-2 relative overflow-hidden
                        ${room.status === 'Available' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-red-50 border-red-100 text-red-700'}
                      `}
                    >
                      <span className="text-xl opacity-80">{room.type === 'Suite' ? '👑' : room.type === 'Double' ? '👥' : '👤'}</span>
                      <span className="text-xs font-black">{room.roomNumber}</span>
                      <div className={`absolute bottom-0 w-full h-1.5 ${room.status === 'Available' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {isModalOpen && selectedRoom && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl">
            <div className={`p-6 text-white flex justify-between items-start ${selectedRoom.status === 'Available' ? 'bg-emerald-500' : 'bg-red-600'}`}>
              <div>
                <span className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">{selectedRoom.status}</span>
                <h2 className="text-3xl font-black mt-2">Room {selectedRoom.roomNumber}</h2>
                <p className="opacity-90 font-medium">{selectedRoom.type} • {selectedRoom.price} ฿/Night</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="bg-black/10 hover:bg-black/20 w-8 h-8 rounded-full flex items-center justify-center transition-colors">✕</button>
            </div>

            <div className="p-8">
              {selectedRoom.status === 'Available' || isEditing ? (
                <form onSubmit={handleBookingSubmit} className="space-y-4">
                  <h3 className="text-lg font-bold text-slate-800 mb-2">{isEditing ? 'Edit Guest Info ✏️' : 'Guest Registration 📝'}</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Full Name</label>
                      <input type="text" required className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none text-sm" value={bookingData.customerName} onChange={e => setBookingData({...bookingData, customerName: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">ID / Passport</label>
                        <input type="text" maxLength={20} required className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none text-sm" value={bookingData.idCard} onChange={e => setBookingData({...bookingData, idCard: e.target.value})} />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Phone Number</label>
                        <input type="text" maxLength={20} required className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none text-sm" value={bookingData.phone} onChange={e => setBookingData({...bookingData, phone: e.target.value})} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Check-in Date</label>
                        <input type="date" min={today} required className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none text-sm" value={bookingData.checkIn} onChange={e => setBookingData({...bookingData, checkIn: e.target.value})} />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Check-out Date</label>
                        <input type="date" min={today} required className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none text-sm" value={bookingData.checkOut} onChange={e => setBookingData({...bookingData, checkOut: e.target.value})} />
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3 pt-4">
                    {isEditing && <button type="button" onClick={() => setIsEditing(false)} className="w-1/3 bg-slate-200 text-slate-600 font-bold py-3.5 rounded-xl text-sm">Cancel</button>}
                    <button type="submit" className={`flex-1 text-white font-black py-3.5 rounded-xl shadow-lg transition-all text-sm uppercase tracking-widest ${isEditing ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-200' : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200'}`}>
                      {isEditing ? 'Save Changes' : 'Confirm Check-In'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  <div className="bg-red-50 p-6 rounded-3xl border border-red-100 relative">
                    <button onClick={() => setIsEditing(true)} className="absolute top-4 right-4 text-xs font-bold bg-white text-slate-600 px-3 py-1 rounded-lg border border-red-100 hover:bg-slate-50">Edit ✏️</button>
                    <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-1">Current Guest</p>
                    <p className="text-2xl font-black text-red-900 mb-2">{currentBooking?.customerName || 'N/A'}</p>
                    <div className="text-sm font-medium text-red-800 space-y-1">
                      <p>🎫 ID: {currentBooking?.idCard || '-'}</p>
                      <p>📞 Tel: {currentBooking?.phone || '-'}</p>
                    </div>
                    <div className="flex justify-between mt-4 text-xs font-bold text-slate-500 bg-white p-3 rounded-xl border border-red-50">
                      <span>IN: {currentBooking?.checkIn || '-'}</span>
                      <span>OUT: {currentBooking?.checkOut || '-'}</span>
                    </div>
                  </div>
                  <button onClick={handleCheckout} className="w-full py-4 rounded-2xl bg-red-600 text-white font-black hover:bg-red-700 shadow-lg shadow-red-200 transition-all text-sm uppercase tracking-widest">
                    Check Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* <div onClick={generate75Rooms} className="fixed bottom-2 right-2 opacity-10 hover:opacity-100 cursor-pointer p-2 transition-opacity z-50">
        <span className="text-xs">⚙️</span>
      </div> */}
    </div>
  );
}