// This file re-exports all models and types from models.ts for backward compatibility
export * from './models';

// Legacy type aliases for compatibility
export type User = import('./models').IUser;
export type Incident = import('./models').IIncident;
export type Resource = import('./models').IResource;
export type Message = import('./models').IMessage;
export type VolunteerAssignment = import('./models').IVolunteerAssignment;