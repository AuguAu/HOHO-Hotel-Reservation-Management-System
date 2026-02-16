import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Room from '@/models/Room';
 
export async function PUT(req, context) {
  await dbConnect();
  try {
    const { id } = await context.params;
    const body = await req.json();
    
    const updatedRoom = await Room.findByIdAndUpdate(id, body, { new: true, runValidators: true });
    if (!updatedRoom) return NextResponse.json({ success: false, error: "Room not found." }, { status: 404 });
 
    return NextResponse.json({ success: true, data: updatedRoom });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}