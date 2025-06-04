
import React, { useEffect, useState, useCallback, ChangeEvent } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Ticket, Comment as CommentType, TicketDepartment, AdminUser } from '../types';
import * as ticketService from '../services/ticketService';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Button } from '../components/common/Button';
import { TextArea } from '../components/common/TextArea';
import { Select } from '../components/common/Select';
import { useNotifications } from '../hooks/useNotifications';
import { useAuth } from '../hooks/useAuth';
import { formatDate, formatDateTime, getTicketStatusFriendly, getInitials } from '../utils/helpers';
import { PaperClipIcon, UserCircleIcon, ChatBubbleLeftEllipsisIcon, CheckCircleIcon, TrashIcon, UserPlusIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { Card } from '../components/common/Card';
import AttachmentLink from '../components/tickets/AttachmentLink';
import CommentCard from '../components/tickets/CommentCard';
import { Modal } from '../components/common/Modal';
import { Input } from '../components/common/Input';

const TicketDetailsPage: React.FC = () => {
  const { ticketId } = useParams<{ ticketId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addNotification } = useNotifications();

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const [newComment, setNewComment] = useState('');
  const [commentFile, setCommentFile] = useState<File | null>(null);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [selectedAdmin, setSelectedAdmin] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);


  const fetchTicketDetails = useCallback(async () => {
    if (!ticketId) return;
    setLoading(true);
    setError(null);
    try {
      const fetchedTicket = await ticketService.getTicketById(ticketId);
      setTicket(fetchedTicket);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch ticket details');
      addNotification(err.message || 'Failed to fetch ticket details', 'error');
      if (err.status === 403 || err.status === 404) {
        navigate('/tickets'); // Or to a specific error page
      }
    } finally {
      setLoading(false);
    }
  }, [ticketId, addNotification, navigate]);

  useEffect(() => {
    fetchTicketDetails();
  }, [fetchTicketDetails]);

  const fetchAdminUsers = useCallback(async () => {
    if (user?.role !== 'admin') return;
    try {
      const data = await ticketService.getAdminUsers();
      setAdminUsers(data.admins.map(email => ({ email }))); // Transform string array to AdminUser array
    } catch (err: any) {
      addNotification(err.message || 'Failed to fetch admin users', 'error');
    }
  }, [user?.role, addNotification]);

  useEffect(() => {
    if (isAssignModalOpen) {
      fetchAdminUsers();
    }
  }, [isAssignModalOpen, fetchAdminUsers]);


  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketId || !newComment.trim()) return;
    setIsSubmittingComment(true);
    try {
      await ticketService.addCommentToTicket(ticketId, newComment, commentFile);
      setNewComment('');
      setCommentFile(null);
      addNotification('Comment added successfully!', 'success');
      fetchTicketDetails(); // Refresh ticket details to show new comment
    } catch (err: any) {
      addNotification(err.message || 'Failed to add comment', 'error');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleCloseTicket = async () => {
    if (!ticketId) return;
    if (window.confirm('Are you sure you want to close this ticket?')) {
      try {
        await ticketService.closeTicket(ticketId);
        addNotification('Ticket closed successfully!', 'success');
        fetchTicketDetails();
      } catch (err: any) {
        addNotification(err.message || 'Failed to close ticket', 'error');
      }
    }
  };
  
  const handleDeleteTicket = async () => {
    if (!ticketId) return;
    if (window.confirm('Are you sure you want to permanently delete this ticket and all its data? This action cannot be undone.')) {
      try {
        await ticketService.deleteTicket(ticketId);
        addNotification('Ticket deleted successfully!', 'success');
        navigate('/tickets');
      } catch (err: any) {
        addNotification(err.message || 'Failed to delete ticket', 'error');
      }
    }
  };

  const handleAssignTicket = async () => {
    if (!ticketId || !selectedAdmin) return;
    setIsAssigning(true);
    try {
      await ticketService.assignTicket(ticketId, selectedAdmin);
      addNotification(`Ticket assigned to ${selectedAdmin}`, 'success');
      fetchTicketDetails();
      setIsAssignModalOpen(false);
      setSelectedAdmin('');
    } catch (err: any) {
      addNotification(err.message || 'Failed to assign ticket', 'error');
    } finally {
      setIsAssigning(false);
    }
  };


  if (loading) return <div className="flex justify-center items-center h-full"><LoadingSpinner size="lg" /></div>;
  if (error) return <p className="text-center text-red-500 dark:text-red-400">{error}</p>;
  if (!ticket) return <p className="text-center text-gray-500 dark:text-gray-400">Ticket not found.</p>;

  const canManageTicket = user?.role === 'admin' || user?.email === ticket.user_email;
  const isAdmin = user?.role === 'admin';
  const isTicketOpen = ticket.status.toLowerCase() === 'open';

  return (
    <div className="container mx-auto px-2 py-6 sm:px-4">
      <div className="mb-6">
        <Link to="/tickets">
          <Button variant="ghost" size="sm" icon={<ArrowLeftIcon className="h-5 w-5" />}>
            Back to Tickets
          </Button>
        </Link>
      </div>

      <Card className="mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">{ticket.title}</h1>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${isTicketOpen ? 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100' : 'bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-100'}`}>
                    {getTicketStatusFriendly(ticket.status)}
                </span>
            </div>
            {isAdmin && isTicketOpen && (
                <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row gap-2">
                    <Button onClick={() => setIsAssignModalOpen(true)} variant="secondary" size="sm" icon={<UserPlusIcon className="h-4 w-4" />}>
                        Assign Ticket
                    </Button>
                    <Button onClick={handleCloseTicket} variant="primary" size="sm" icon={<CheckCircleIcon className="h-4 w-4" />}>
                        Close Ticket
                    </Button>
                </div>
            )}
             {isAdmin && (
                <Button onClick={handleDeleteTicket} variant="danger" size="sm" icon={<TrashIcon className="h-4 w-4" />} className="mt-4 sm:mt-0 sm:ml-2">
                    Delete Ticket
                </Button>
            )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-sm text-gray-600 dark:text-gray-300">
            <p><strong>ID:</strong> {ticket.id}</p>
            <p><strong>Created:</strong> {formatDateTime(ticket.timestamp)} by {ticket.user_email || 'N/A'}</p>
            <p><strong>Department:</strong> {ticket.department}</p>
            <p><strong>Location:</strong> {ticket.location}</p>
            <p><strong>Assigned To:</strong> {ticket.assignee_email || 'Unassigned'}</p>
            <p><strong>Shimmer Ticket:</strong> {ticket.shimmer ? 'Yes' : 'No'}</p>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">Description</h3>
            <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{ticket.description}</p>
        </div>

        {ticket.attachments && ticket.attachments.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">Attachments</h3>
            <ul className="space-y-2">
                {ticket.attachments.map(att => (
                <AttachmentLink key={att.id} attachment={att} />
                ))}
            </ul>
            </div>
        )}
      </Card>

      {/* Comments Section */}
      <Card title="Comments" className="mb-6">
        <div className="space-y-4">
          {ticket.comments && ticket.comments.length > 0 ? (
            ticket.comments.map(comment => (
              <CommentCard key={comment.id} comment={comment} />
            ))
          ) : (
            <p className="text-gray-500 dark:text-gray-400">No comments yet.</p>
          )}
        </div>
      </Card>

      {/* Add Comment Form */}
      {isTicketOpen && canManageTicket && (
        <Card title="Add a Comment">
          <form onSubmit={handleCommentSubmit} className="space-y-4">
            <TextArea
              label="Your Comment"
              id="new-comment"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              required
              rows={4}
              placeholder="Type your comment here..."
            />
            <div>
              <label htmlFor="comment-file" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Attach File (Optional)</label>
              <Input
                id="comment-file"
                type="file"
                onChange={(e) => setCommentFile(e.target.files ? e.target.files[0] : null)}
                className="text-sm"
              />
            </div>
            <Button type="submit" isLoading={isSubmittingComment} icon={<ChatBubbleLeftEllipsisIcon className="h-5 w-5"/>}>
              Submit Comment
            </Button>
          </form>
        </Card>
      )}

      {/* Assign Ticket Modal */}
      <Modal isOpen={isAssignModalOpen} onClose={() => setIsAssignModalOpen(false)} title="Assign Ticket">
        <div className="space-y-4">
            <Select
                label="Select Admin User"
                options={adminUsers.map(au => ({ value: au.email, label: au.email }))}
                value={selectedAdmin}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setSelectedAdmin(e.target.value)}
                placeholder="Choose an admin"
            />
            <div className="flex justify-end space-x-2">
                <Button variant="ghost" onClick={() => setIsAssignModalOpen(false)}>Cancel</Button>
                <Button onClick={handleAssignTicket} isLoading={isAssigning} disabled={!selectedAdmin}>Assign</Button>
            </div>
        </div>
      </Modal>
    </div>
  );
};

export default TicketDetailsPage;