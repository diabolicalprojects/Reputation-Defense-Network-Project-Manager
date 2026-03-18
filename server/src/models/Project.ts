import mongoose, { Schema, Document, Types } from 'mongoose';

export type ProjectStatus = 'NEW' | 'DESIGN' | 'DESIGN_REVIEW' | 'DEVELOPMENT' | 'INTERNAL_REVIEW' | 'COMPLETED';

export interface ISopTask {
  task: string;
  isCompleted: boolean;
}

export interface IProject extends Document {
  title: string;
  client: Types.ObjectId;
  pmId: Types.ObjectId;
  status: ProjectStatus;
  designerId: Types.ObjectId | null;
  developerId: Types.ObjectId | null;
  assets: {
    driveLink: string;
    figmaLink: string;
  };
  developmentData: {
    domainUrl: string;
    wpAdminUser: string;
    wpAdminPassword: string;
  };
  notes: string;
  designerSop: ISopTask[];
  developerSop: ISopTask[];
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const SopTaskSchema = new Schema<ISopTask>(
  {
    task: { type: String, required: true },
    isCompleted: { type: Boolean, default: false },
  },
  { _id: true }
);

const ProjectSchema = new Schema<IProject>(
  {
    title: { type: String, required: true, trim: true },
    client: { type: Schema.Types.ObjectId, ref: 'Client', required: true },
    pmId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    status: {
      type: String,
      enum: ['NEW', 'DESIGN', 'DESIGN_REVIEW', 'DEVELOPMENT', 'INTERNAL_REVIEW', 'COMPLETED'],
      default: 'NEW',
    },
    designerId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    developerId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    assets: {
      driveLink: { type: String, default: '' },
      figmaLink: { type: String, default: '' },
    },
    developmentData: {
      domainUrl: { type: String, default: '' },
      wpAdminUser: { type: String, default: '' },
      wpAdminPassword: { type: String, default: '' },
    },
    notes: { type: String, default: '' },
    designerSop: [SopTaskSchema],
    developerSop: [SopTaskSchema],
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model<IProject>('Project', ProjectSchema);
