import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
 
// POST: Authenticate admin login credentials
export async function POST(req) {
  await dbConnect();
  try {
    const { username, password } = await req.json();
 
    // 1. Check if the user exists
    const user = await User.findOne({ username });
    if (!user) {
      return NextResponse.json({ success: false, error: "Invalid username or password." }, { status: 401 });
    }
 
    // 2. Validate password (Plain text comparison for university project purposes)
    // Note: In a production environment, use bcrypt to compare hashed passwords.
    if (user.password !== password) {
      return NextResponse.json({ success: false, error: "Invalid username or password." }, { status: 401 });
    }
 
    // 3. Return user data (excluding password)
    const userData = {
      _id: user._id,
      username: user.username,
      role: user.role,
      profileImage: user.profileImage
    };
 
    return NextResponse.json({ success: true, data: userData });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}