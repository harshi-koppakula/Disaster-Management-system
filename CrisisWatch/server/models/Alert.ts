// server/models/Alert.ts
import { Schema, model } from 'mongoose';

const alertSchema = new Schema({
  title: { type: String, required: true },
  description: String,
  severity: { type: String, enum: ['Low', 'Medium', 'High'], required: true },
  date: { type: Date, default: Date.now },
  region: { type: String, required: true }
});

export const Alert = model('Alert', alertSchema);
