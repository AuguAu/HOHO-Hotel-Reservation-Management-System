import mongoose from 'mongoose';
 
const RoomSchema = new mongoose.Schema({
  roomNumber: { type: String, required: true, unique: true },
  type: { type: String, enum: ['Single', 'Double', 'Suite'], required: true },
  price: { type: Number, required: true },
  floor: { type: Number, required: true },
  status: { type: String, enum: ['Available', 'Occupied', 'Maintenance'], default: 'Available' },
  details: { type: String, default: 'Standard room facilities.' } // Edit details
});
 
export default mongoose.models.Room || mongoose.model('Room', RoomSchema);