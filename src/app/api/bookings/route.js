import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Booking from '@/models/Booking';
import Room from '@/models/Room';
 
// GET: Fetch all bookings (used for the Admin Dashboard statistics)
export async function GET() {
  await dbConnect();
  try {
    // .populate() will pull the actual room data based on the roomID reference
    const bookings = await Booking.find({}).populate('roomID').sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: bookings });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
 
// POST: Create a new booking and automatically update room status to 'Occupied'
export async function POST(req) {
  await dbConnect();
  try {
    const body = await req.json();
    
    // 1. Create the new booking record
    const booking = await Booking.create(body);
 
    // 2. Change the room status to 'Occupied' (Red color in UI)
    await Room.findByIdAndUpdate(body.roomID, { status: 'Occupied' });
 
    return NextResponse.json({ success: true, data: booking }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}