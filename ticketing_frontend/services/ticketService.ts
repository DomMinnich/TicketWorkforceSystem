
import { Ticket, Comment, TicketAttachment, TicketDepartment, AdminUser } from '../types';
import { apiFetch, postFormData } from './api';
import { API_BASE_URL } from '../constants';

// Fetch all tickets (or based on search/filter)

export const getTickets = async (params: {
  search?: string;
  department?: string;
  include_shimmer?: boolean;
  status?: string;  // Make sure this is included
  sort_by?: string;
}) => {
  // Build query parameters
  const queryParams = new URLSearchParams();
  if (params.search) queryParams.append('search', params.search);
  if (params.department) queryParams.append('department', params.department);
  if (params.include_shimmer !== undefined) queryParams.append('include_shimmer', params.include_shimmer.toString());
  if (params.status && params.status !== 'all') queryParams.append('status', params.status);
  if (params.sort_by) queryParams.append('sort_by', params.sort_by);

  return apiFetch(`/tickets?${queryParams.toString()}`);
};

// Fetch a single ticket by ID
export const getTicketById = async (ticketId: string): Promise<Ticket> => {
  return apiFetch(`/tickets/${ticketId}`, { method: 'GET' });
};

// Create a new ticket
export const createTicket = async (data: {
  title: string;
  description: string;
  location: string;
  shimmer: boolean;
  department: TicketDepartment;
  file?: File | null;
}): Promise<Ticket> => {
  const formData = new FormData();
  formData.append('title', data.title);
  formData.append('description', data.description);
  formData.append('location', data.location);
  formData.append('shimmer', String(data.shimmer));
  formData.append('department', data.department);
  if (data.file) {
    formData.append('file', data.file);
  }
  return postFormData(`/tickets/`, formData);
};

// Add a comment to a ticket
export const addCommentToTicket = async (
  ticketId: string,
  commentText: string,
  file?: File | null
): Promise<Comment> => {
  const formData = new FormData();
  formData.append('comment_text', commentText);
  if (file) {
    formData.append('file', file);
  }
  return postFormData(`/tickets/${ticketId}/comments`, formData);
};

// Get total comments for a ticket
export const getCommentsCount = async (ticketId: string): Promise<{ ticket_id: string, total_comments: number }> => {
  return apiFetch(`/tickets/${ticketId}/comments/count`, { method: 'GET' });
};


// Close a ticket
export const closeTicket = async (ticketId: string): Promise<{ message: string; ticket: Ticket }> => {
  return apiFetch(`/tickets/${ticketId}/close`, { method: 'PUT' });
};

// Delete a ticket (Admin only)
export const deleteTicket = async (ticketId: string): Promise<{ message: string }> => {
  return apiFetch(`/tickets/${ticketId}`, { method: 'DELETE' });
};

// Assign a ticket (Admin only)
export const assignTicket = async (ticketId: string, assigneeEmail: string): Promise<{ message: string; ticket: Ticket }> => {
  return apiFetch(`/tickets/${ticketId}/assign`, {
    method: 'PUT',
    body: JSON.stringify({ assignee_email: assigneeEmail }),
  });
};

// Get list of admin users for assignment dropdown
export const getAdminUsers = async (): Promise<{admins: string[]}> => {
  return apiFetch('/users/admins', { method: 'GET' });
};

// Note: Attachment download is a direct link: /api/tickets/attachments/<attachment_id>
// No specific service function needed, just construct the URL.
export const getAttachmentDownloadUrl = (attachmentId: number): string => {
    return `${API_BASE_URL}/tickets/attachments/${attachmentId}`;
};