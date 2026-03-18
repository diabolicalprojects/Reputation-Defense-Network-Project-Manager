import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'PM' | 'DESIGNER' | 'DEVELOPER' | 'BOTH';
  isActive: boolean;
  managedBy?: mongoose.Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['PM', 'DESIGNER', 'DEVELOPER', 'BOTH'], required: true },
    isActive: { type: Boolean, default: true },
    managedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null, index: true },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>('User', UserSchema);
