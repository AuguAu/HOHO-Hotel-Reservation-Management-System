import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Booking from '@/models/Booking';
import Room from '@/models/Room';

export async function PUT(req, context) {
  await dbConnect();
  try {
    const { id } = await context.params;
    const body = await req.json();

    if (body.action === 'checkout') {
      // Update status as completed and record the checkout time
      const updatedBooking = await Booking.findByIdAndUpdate(id, {
        status: 'Completed',
        actualCheckOutTime: new Date(),
        checkOutBy: body.checkOutBy //
      }, { new: true });

      // Change the room colour to green (Available)
      await Room.findByIdAndUpdate(body.roomID, { status: 'Available' });

      return NextResponse.json({ success: true, message: 'Checkout successful', data: updatedBooking });
    }

    if (body.action === 'edit') {
      const updated = await Booking.findByIdAndUpdate(id, {
        customerName: body.customerName,
        idCard: body.idCard,
        phone: body.phone,
        checkIn: body.checkIn,
        checkOut: body.checkOut
      }, { new: true });
      return NextResponse.json({ success: true, data: updated });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}