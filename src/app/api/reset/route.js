import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Room from '@/models/Room';
import Booking from '@/models/Booking';

export async function POST() {
  await dbConnect();
  try {
    // Delete all old data
    await Room.deleteMany({});
    await Booking.deleteMany({});

    // Create 75 new rooms
    const roomsToInsert = [];
    for (let floor = 1; floor <= 5; floor++) {
      for (let r = 1; r <= 15; r++) {
        let type = r <= 5 ? 'Single' : r <= 10 ? 'Double' : 'Suite';
        let price = r <= 5 ? 1500 : r <= 10 ? 2500 : 4500;
        const roomNum = `${floor}${r.toString().padStart(2, '0')}`;
        roomsToInsert.push({ roomNumber: roomNum, type, price, floor, status: 'Available' });
      }
    }
    
    // Save to Database
    await Room.insertMany(roomsToInsert);

    return NextResponse.json({ success: true, message: "System Reset Successfully!" });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}