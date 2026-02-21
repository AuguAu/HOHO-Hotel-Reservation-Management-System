import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function POST(req) {
  await dbConnect();
  try {
    const { username, password } = await req.json();
    
    const user = await User.findOne({ username, password });
    
    if (!user) {
      return NextResponse.json({ success: false, error: "Invalid username or password" }, { status: 401 });
    }

    return NextResponse.json({ 
      success: true, 
      data: { _id: user._id, username: user.username, role: user.role, name: user.name } 
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}