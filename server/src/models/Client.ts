import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IClient extends Document {
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  notes: string;
  pmId: Types.ObjectId;
  projects: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const ClientSchema = new Schema<IClient>(
  {
    companyName: { type: String, required: true, trim: true },
    contactName: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    notes: { type: String, default: '' },
    pmId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    projects: [{ type: Schema.Types.ObjectId, ref: 'Project' }],
  },
  { timestamps: true }
);

export default mongoose.model<IClient>('Client', ClientSchema);
