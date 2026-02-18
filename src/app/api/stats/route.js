import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Room from '@/models/Room';
import Booking from '@/models/Booking';

// force-dynamic (to make it real-time)
export const dynamic = 'force-dynamic'; 

export async function GET() {
  await dbConnect();
  try {
    //Top 3 Popular (from booking)
    const popularStats = await Booking.aggregate([
      { $lookup: { from: 'rooms', localField: 'roomID', foreignField: '_id', as: 'roomInfo' } },
      { $unwind: '$roomInfo' },
      { $group: { _id: '$roomInfo.type', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 3 }
    ]);

    //How many rooms (Occupancy)
    const occupancyStats = await Room.aggregate([
      {
        $group: {
          _id: '$type',
          total: { $sum: 1 },
          occupied: { $sum: { $cond: [{ $eq: ["$status", "Occupied"] }, 1, 0] } }
        }
      },
      { $sort: { _id: 1 } }

    ]);

    return NextResponse.json({ success: true, popular: popularStats, occupancy: occupancyStats });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}