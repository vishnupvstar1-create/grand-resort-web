import mongoose, { Schema, Document } from 'mongoose';

export interface IBooking extends Document {
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  roomType: string;
  checkIn: Date;
  checkOut: Date;
  status: string;
}

const BookingSchema: Schema = new Schema({
  guestName: { type: String, required: true },
  guestEmail: { type: String, required: false },
  guestPhone: { type: String, required: true },
  roomType: { type: String, required: true },
  checkIn: { type: Date, required: true },
  checkOut: { type: Date, required: true },
  // Set default to 'Pending' so admins can approve it in the dashboard
  status: { type: String, default: 'Pending' } 
}, { timestamps: true });

export default mongoose.models.Booking || mongoose.model<IBooking>('Booking', BookingSchema);