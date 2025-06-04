
export interface User {
  id: number;
  email: string;
  role: UserRole;
  associations: string; // Comma-separated string, e.g., "IT,Maintenance" or "alpha"
}

export type UserRole = 'user' | 'admin';

export interface AuthStatus {
  is_authenticated: boolean;
  user_email?: string;
  user_role?: UserRole;
  user_associations?: string;
}

export interface TicketAttachment {
  id: number;
  filename: string;
  url: string; // e.g., /api/attachments/<id>
}

export interface Comment {
  id: number;
  ticket_id: string;
  user_email: string | null;
  text: string;
  timestamp: string; // ISO string
  attachments: TicketAttachment[];
}

export enum TicketDepartment {
  IT = 'IT',
  Maintenance = 'Maintenance',
  Management = 'Management',
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  location: string;
  user_email: string | null; // Creator's email
  timestamp: string; // ISO string
  status: string; // 'open' or 'Closed: YYYY-MM-DD HH:MM:SS'
  assignee_email: string | null;
  shimmer: boolean;
  department: TicketDepartment;
  attachments: TicketAttachment[];
  comments?: Comment[];
  total_comments?: number;
}

export interface EquipmentRequest {
  id: string;
  name: string;
  event: string;
  date: string; // ISO date string YYYY-MM-DD
  time: string;
  location: string;
  equipment: string;
  description: string;
  return_date: string; // ISO date string YYYY-MM-DD
  return_time: string;
  user_email: string | null;
  timestamp: string; // ISO string
  status: 'open' | 'closed';
  approval_status: 'pending' | 'approved' | 'denied';
}

export interface UserRequest { // New Employee Request
  id: string;
  fname: string;
  lname: string;
  job_title: string;
  department: string;
  start_date: string; // ISO date string YYYY-MM-DD
  description: string;
  user_email: string | null;
  timestamp: string; // ISO string
  status: 'open' | 'closed';
}

export interface StudentRequest {
  id: string;
  fname: string;
  lname: string;
  grade: string;
  teacher: string;
  description: string;
  user_email: string | null;
  timestamp: string; // ISO string
  status: 'open' | 'closed';
  email_created: boolean;
  computer_created: boolean;
  bag_created: boolean;
  id_card_created: boolean;
  azure_created: boolean;
}

export enum TaskCategory {
  Tech = 'tech',
  Maintenance = 'maintenance',
  Administration = 'administration',
}

export interface Task {
  id: number;
  title: string;
  description: string | null;
  created_at: string; // ISO string
  completed: boolean;
  completed_at: string | null; // ISO string
  last_completed_at: string | null; // ISO string
  category: TaskCategory;
  created_by_email: string | null;
}

export interface LogEntry {
  id: number;
  message: string;
  timestamp: string; // ISO string
  category: TaskCategory;
  user_email: string | null;
}

export interface DashboardStatistics {
  num_total_tickets: number;
  num_open_tickets: number;
  num_closed_tickets: number;
  num_comments: number;
  num_shimmer_tickets: number;
  num_equipment_requests: number;
  num_user_requests: number;
  num_student_requests: number;
  total_requests: number;
  total_users: number;
  tickets_by_department: { [department_value: string]: number };
}

export interface ApiError {
  message: string;
  error?: string; // From backend error structure
  status?: number; // HTTP status code
}

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface Notification {
  id: string;
  message: string;
  type: NotificationType;
}

// For user management, when listing all users
export interface ManagedUser extends User {
  // any additional fields specific to management view if needed
}

// For assigning tickets
export interface AdminUser {
  email: string;
}
