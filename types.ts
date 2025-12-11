export enum Role {
  USER = 'user',
  MODEL = 'model',
  SYSTEM = 'system'
}

export interface Message {
  id: string;
  role: Role;
  text: string;
  timestamp: Date;
  isToolUse?: boolean;
  toolName?: string;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}

// Mock Data Types for our simulated database
export interface PatientProfile {
  id: string;
  name: string;
  dob: string;
  condition: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctor: string;
  time: string;
  status: string;
}

export interface Bill {
  id: string;
  patientId: string;
  amount: number;
  status: 'Paid' | 'Pending';
  description: string;
}
