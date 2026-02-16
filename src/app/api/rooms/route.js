import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Room from '@/models/Room';
 
// GET: Fetch all rooms for the grid display
export async function GET() {
  await dbConnect();
  try {
    const rooms = await Room.find({}).sort({ roomNumber: 1 });
    return NextResponse.json({ success: true, data: rooms });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
 
// POST: Create a new room (used for the "Generate 75 Rooms" button)
export async function POST(req) {
  await dbConnect();
  try {
    const body = await req.json();
    const room = await Room.create(body);
    return NextResponse.json({ success: true, data: room }, { status: 201 });
  } catch (error) {
    // Check if error is due to duplicate room number
    if (error.code === 11000) {
      return NextResponse.json({ success: false, error: "Room number already exists." }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}