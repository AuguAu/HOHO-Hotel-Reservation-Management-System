import mongoose from 'mongoose';
 
const BookingSchema = new mongoose.Schema({
  roomID: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  customerName: { type: String, required: true },
  idCard: { type: String, required: true }, // National ID
  phone: { type: String, required: true },  // Phone Number
  checkIn: { type: String, required: true }, // Planned Check-in Date
  checkOut: { type: String, required: true }, // Planned Check-out Date
  actualCheckInTime: { type: Date, default: Date.now }, // Real Check-in Timestamp
  actualCheckOutTime: { type: Date }, // Real Check-out Timestamp
  status: { type: String, enum: ['Active', 'Completed', 'Cancelled'], default: 'Active' }
}, { timestamps: true });
 
export default mongoose.models.Booking || mongoose.model('Booking', BookingSchema);