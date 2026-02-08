export type Role = "admin" | "manager" | "agent";

export type DealStage =
  | "lead"
  | "qualified"
  | "proposal"
  | "negotiation"
  | "won"
  | "lost";

export type ActivityType = "call" | "email" | "meeting" | "note" | "task";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  active: boolean;
  created_at: string;
}

export interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  company_id: string | null;
  owner_id: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  company?: Company;
}

export interface Company {
  id: string;
  name: string;
  industry: string | null;
  website: string | null;
  address: string | null;
  created_at: string;
  updated_at: string;
  contacts?: Contact[];
}

export interface Deal {
  id: string;
  title: string;
  value: number | null;
  currency: string;
  stage: DealStage;
  contact_id: string;
  company_id: string | null;
  owner_id: string;
  expected_close_date: string | null;
  closed_at: string | null;
  created_at: string;
  updated_at: string;
  contact?: Contact;
  company?: Company;
}

export interface Activity {
  id: string;
  type: ActivityType;
  subject: string;
  description: string | null;
  contact_id: string | null;
  deal_id: string | null;
  owner_id: string;
  due_date: string | null;
  completed: boolean;
  created_at: string;
  contact?: Contact;
  deal?: Deal;
}

export const DEAL_STAGES: { value: DealStage; label: string }[] = [
  { value: "lead", label: "Lead" },
  { value: "qualified", label: "Qualified" },
  { value: "proposal", label: "Proposal" },
  { value: "negotiation", label: "Negotiation" },
  { value: "won", label: "Won" },
  { value: "lost", label: "Lost" },
];

export const ACTIVITY_TYPES: { value: ActivityType; label: string }[] = [
  { value: "call", label: "Call" },
  { value: "email", label: "Email" },
  { value: "meeting", label: "Meeting" },
  { value: "note", label: "Note" },
  { value: "task", label: "Task" },
];
