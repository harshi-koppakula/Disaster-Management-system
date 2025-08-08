import mongoose, { Document, Schema } from 'mongoose';
import { z } from 'zod';

// Base interfaces
export interface IUser extends Document {
  username: string;
  password: string;
  role: 'government' | 'volunteer' | 'social' | 'victim';
  name: string;
  email?: string;
  phone?: string;
  location?: string;
  isSpoc: boolean;
  createdAt: Date;
}

export interface IIncident extends Document {
  title: string;
  description: string;
  location: string;
  coordinates?: { lat: number; lng: number };
  priority: 'high' | 'medium' | 'low';
  status: 'active' | 'in_progress' | 'resolved';
  type: string;
  reportedBy?: mongoose.Types.ObjectId;
  assignedTo?: mongoose.Types.ObjectId;
  spocId?: mongoose.Types.ObjectId;
  affectedCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IResource extends Document {
  name: string;
  type: string;
  quantity: number;
  available: number;
  location: string;
  status: 'available' | 'deployed' | 'critical';
  assignedIncident?: mongoose.Types.ObjectId;
  eta?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMessage extends Document {
  content: string;
  senderId?: mongoose.Types.ObjectId;
  incidentId?: mongoose.Types.ObjectId;
  isEmergency: boolean;
  createdAt: Date;
}

export interface IVolunteerAssignment extends Document {
  volunteerId: mongoose.Types.ObjectId;
  incidentId: mongoose.Types.ObjectId;
  role: string;
  status: 'assigned' | 'active' | 'completed';
  assignedAt: Date;
}

// Mongoose Schemas
const userSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true, default: 'volunteer', enum: ['government', 'volunteer', 'social', 'victim'] },
  name: { type: String, required: true },
  email: { type: String },
  phone: { type: String },
  location: { type: String },
  isSpoc: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const incidentSchema = new Schema<IIncident>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  coordinates: {
    lat: { type: Number },
    lng: { type: Number }
  },
  priority: { type: String, required: true, default: 'medium', enum: ['high', 'medium', 'low'] },
  status: { type: String, required: true, default: 'active', enum: ['active', 'in_progress', 'resolved'] },
  type: { type: String, required: true },
  reportedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
  spocId: { type: Schema.Types.ObjectId, ref: 'User' },
  affectedCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const resourceSchema = new Schema<IResource>({
  name: { type: String, required: true },
  type: { type: String, required: true },
  quantity: { type: Number, required: true },
  available: { type: Number, required: true },
  location: { type: String, required: true },
  status: { type: String, required: true, default: 'available', enum: ['available', 'deployed', 'critical'] },
  assignedIncident: { type: Schema.Types.ObjectId, ref: 'Incident' },
  eta: { type: Number },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const messageSchema = new Schema<IMessage>({
  content: { type: String, required: true },
  senderId: { type: Schema.Types.ObjectId, ref: 'User' },
  incidentId: { type: Schema.Types.ObjectId, ref: 'Incident' },
  isEmergency: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const volunteerAssignmentSchema = new Schema<IVolunteerAssignment>({
  volunteerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  incidentId: { type: Schema.Types.ObjectId, ref: 'Incident', required: true },
  role: { type: String, required: true },
  status: { type: String, required: true, default: 'assigned', enum: ['assigned', 'active', 'completed'] },
  assignedAt: { type: Date, default: Date.now }
});

// Models
export const User = mongoose.model<IUser>('User', userSchema);
export const Incident = mongoose.model<IIncident>('Incident', incidentSchema);
export const Resource = mongoose.model<IResource>('Resource', resourceSchema);
export const Message = mongoose.model<IMessage>('Message', messageSchema);
export const VolunteerAssignment = mongoose.model<IVolunteerAssignment>('VolunteerAssignment', volunteerAssignmentSchema);

// Zod validation schemas
export const insertUserSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(6),
  role: z.enum(['government', 'volunteer', 'social', 'victim']).default('volunteer'),
  name: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  location: z.string().optional(),
  isSpoc: z.boolean().default(false)
});

export const insertIncidentSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  location: z.string().min(1),
  coordinates: z.object({
    lat: z.number(),
    lng: z.number()
  }).optional(),
  priority: z.enum(['high', 'medium', 'low']).default('medium'),
  status: z.enum(['active', 'in_progress', 'resolved']).default('active'),
  type: z.string().min(1),
  reportedBy: z.string().optional(),
  assignedTo: z.string().optional(),
  spocId: z.string().optional(),
  affectedCount: z.number().default(0)
});

export const insertResourceSchema = z.object({
  name: z.string().min(1),
  type: z.string().min(1),
  quantity: z.number().min(1),
  available: z.number().min(0),
  location: z.string().min(1),
  status: z.enum(['available', 'deployed', 'critical']).default('available'),
  assignedIncident: z.string().optional(),
  eta: z.number().optional()
});

export const insertMessageSchema = z.object({
  content: z.string().min(1),
  senderId: z.string().optional(),
  incidentId: z.string().optional(),
  isEmergency: z.boolean().default(false)
});

export const insertVolunteerAssignmentSchema = z.object({
  volunteerId: z.string(),
  incidentId: z.string(),
  role: z.string().min(1),
  status: z.enum(['assigned', 'active', 'completed']).default('assigned')
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertIncident = z.infer<typeof insertIncidentSchema>;
export type InsertResource = z.infer<typeof insertResourceSchema>;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type InsertVolunteerAssignment = z.infer<typeof insertVolunteerAssignmentSchema>;

// Extended types for API responses
export type IncidentWithUsers = IIncident & {
  reportedByUser?: IUser;
  assignedToUser?: IUser;
  spocUser?: IUser;
};

export type MessageWithUser = IMessage & {
  sender: IUser;
};

export type ResourceWithIncident = IResource & {
  incident?: IIncident;
};