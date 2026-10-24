import mongoose, { Schema, Document } from 'mongoose';

export interface IRoom extends Document {
  roomNumber: string;
  roomType: 'Normal' | 'Deluxe' | 'Super Luxury';
  price: number;
  status: 'Available' | 'Booked' | 'Maintenance';
  description: string;
}

const RoomSchema: Schema = new Schema({
  roomNumber: { type: String, required: true, unique: true },
  roomType: { type: String, required: true },
  price: { type: Number, required: true },
  status: { type: String, default: 'Available' },
  description: { type: String }
}, { timestamps: true });

export default mongoose.models.Room || mongoose.model<IRoom>('Room', RoomSchema);