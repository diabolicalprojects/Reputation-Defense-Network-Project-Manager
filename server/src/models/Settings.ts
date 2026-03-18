import mongoose, { Schema, Document } from 'mongoose';

export interface ISettings extends Document {
  pmId: mongoose.Types.ObjectId;
  designerSopTemplate: string[];
  developerSopTemplate: string[];
}

const SettingsSchema = new Schema<ISettings>({
  pmId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  designerSopTemplate: { type: [String], default: [] },
  developerSopTemplate: { type: [String], default: [] },
});

export default mongoose.model<ISettings>('Settings', SettingsSchema);
