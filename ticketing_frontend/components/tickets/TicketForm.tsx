
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TicketDepartment } from '../../types';
import * as ticketService from '../../services/ticketService';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { TextArea } from '../common/TextArea';
import { Select } from '../common/Select';
import { Checkbox } from '../common/Checkbox';
import { useNotifications } from '../../hooks/useNotifications';
import { useAuth } from '../../hooks/useAuth'; // To check if user is admin for shimmer
import { DEPARTMENTS } from '../../constants';

const TicketForm: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth(); // Get current user
  const { addNotification } = useNotifications();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [department, setDepartment] = useState<TicketDepartment>(TicketDepartment.IT);
  const [shimmer, setShimmer] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const departmentOptions = DEPARTMENTS.map(d => ({ value: d, label: d }));

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = 'Title is required.';
    if (!description.trim()) newErrors.description = 'Description is required.';
    if (!location.trim()) newErrors.location = 'Location is required.';
    if (!department) newErrors.department = 'Department is required.';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await ticketService.createTicket({
        title,
        description,
        location,
        department,
        shimmer: user?.role === 'admin' ? shimmer : false, // Only admins can set shimmer
        file,
      });
      addNotification('Ticket created successfully!', 'success');
      navigate('/tickets');
    } catch (err: any) {
      addNotification(err.message || 'Failed to create ticket', 'error');
      // Optionally set form-level error from API if available
      // if (err.errors) setErrors(prev => ({ ...prev, ...err.errors }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label="Title"
        id="title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        error={errors.title}
        required
      />
      <TextArea
        label="Description"
        id="description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        error={errors.description}
        required
        rows={5}
      />
      <Input
        label="Location"
        id="location"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        error={errors.location}
        required
      />
      <Select
        label="Department"
        id="department"
        options={departmentOptions}
        value={department}
        onChange={(e) => setDepartment(e.target.value as TicketDepartment)}
        error={errors.department}
        required
      />
      {user?.role === 'admin' && (
        <Checkbox
          label="Visible To Only ADMINS"
          id="shimmer"
          checked={shimmer}
          onChange={(e) => setShimmer(e.target.checked)}
        />
      )}
      <div>
        <label htmlFor="file" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Attach File (Optional)
        </label>
        <Input
          id="file"
          type="file"
          onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
          className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-light file:text-primary-dark hover:file:bg-primary dark:file:bg-primary-dark dark:file:text-primary-light dark:hover:file:bg-primary-darker"
        />
      </div>
      <Button type="submit" isLoading={isLoading} className="w-full">
        Create Ticket
      </Button>
    </form>
  );
};

export default TicketForm;
