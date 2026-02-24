import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function PUT(req, context) {
  await dbConnect();
  const { id } = await context.params;
  const body = await req.json();
  const updated = await User.findByIdAndUpdate(id, body, { new: true });
  return NextResponse.json({ success: true, data: updated });
}

export async function DELETE(req, context) {
  await dbConnect();
  const { id } = await context.params;
  await User.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}