import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Booking from '@/models/Booking';

// POST /api/bookings
export async function POST(request: Request) {
  try {
    const body = await request.json();
    await connectToDatabase();

    const newBooking = new Booking({
      guestName: body.guestName,
      guestEmail: body.guestEmail,
      guestPhone: body.guestPhone,
      roomType: body.roomType,
      checkIn: new Date(body.checkIn),
      checkOut: new Date(body.checkOut),
    });

    await newBooking.save();

    return NextResponse.json(
      { message: 'Booking submitted successfully!' }, 
      { status: 201 }
    );
  } catch (error) {
    console.error('Booking Error:', error);
    return NextResponse.json(
      { message: 'Failed to submit booking' }, 
      { status: 500 }
    );
  }
}