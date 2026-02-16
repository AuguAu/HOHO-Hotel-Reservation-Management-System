import mongoose from 'mongoose';
 
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Password
  role: { type: String, enum: ['SuperAdmin', 'Admin'], default: 'Admin' }, // Role Base Access
  profileImage: { type: String, default: '' } // Profile picture
}, { timestamps: true });
 
export default mongoose.models.User || mongoose.model('User', UserSchema);