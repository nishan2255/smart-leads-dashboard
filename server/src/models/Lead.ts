import mongoose, { Schema } from 'mongoose';
import { ILead } from '../types/index.js';

const LeadSchema = new Schema<ILead>(
  {
    name: {
      type: String,
      required: [true, 'Lead name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    status: {
      type: String,
      enum: {
        values: ['New', 'Contacted', 'Qualified', 'Lost'],
        message: 'Status must be one of: New, Contacted, Qualified, Lost',
      },
      default: 'New',
    },
    source: {
      type: String,
      enum: {
        values: ['Website', 'Instagram', 'Referral'],
        message: 'Source must be one of: Website, Instagram, Referral',
      },
      required: [true, 'Source is required'],
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Index for faster search queries
LeadSchema.index({ name: 'text', email: 'text' });
LeadSchema.index({ status: 1 });
LeadSchema.index({ source: 1 });
LeadSchema.index({ createdAt: -1 });

const Lead = mongoose.model<ILead>('Lead', LeadSchema);

export default Lead;
