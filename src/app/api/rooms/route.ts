import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
// Note: You will need to copy your Room.js schema over as a TypeScript model (e.g., Room.ts)
import Room from '@/models/Room'; 

// GET /api/rooms
export async function GET() {
  try {
    await connectToDatabase();
    
    // Fetch rooms from the exact same database your Admin Dashboard uses
    const rooms = await Room.find({ status: 'Available' });
    
    return NextResponse.json(rooms, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch rooms' }, { status: 500 });
  }
}