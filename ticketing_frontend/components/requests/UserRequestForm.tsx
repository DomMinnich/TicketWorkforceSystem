import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as requestService from '../../services/requestService';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { TextArea } from '../common/TextArea';
import { useNotifications } from '../../hooks/useNotifications';


const UserRequestForm: React.FC = () => {
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  const [formData, setFormData] = useState({
    fname: '',
    lname: '',
    job_title: '',
    department: '', // Changed from DEPARTMENTS[0] || ''
    start_date: '', // YYYY-MM-DD
    description: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // const departmentOptions = DEPARTMENTS.map(d => ({ value: d, label: d }));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement /* Removed HTMLSelectElement */>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.fname.trim()) newErrors.fname = 'First name is required.';
    if (!formData.lname.trim()) newErrors.lname = 'Last name is required.';
    if (!formData.job_title.trim()) newErrors.job_title = 'Job title is required.';
    if (!formData.department.trim()) newErrors.department = 'Department is required.';
    if (!formData.start_date) newErrors.start_date = 'Start date is required.';
    if (!formData.description.trim()) newErrors.description = 'Description of needs is required.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await requestService.createUserRequest(formData);
      addNotification('New employee request submitted successfully!', 'success');
      navigate('/requests/users');
    } catch (err: any) {
      addNotification(err.message || 'Failed to submit new employee request', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input label="First Name" id="fname" name="fname" value={formData.fname} onChange={handleChange} error={errors.fname} required />
        <Input label="Last Name" id="lname" name="lname" value={formData.lname} onChange={handleChange} error={errors.lname} required />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input label="Job Title" id="job_title" name="job_title" value={formData.job_title} onChange={handleChange} error={errors.job_title} required />
        <Input label="Department" id="department" name="department" value={formData.department} onChange={handleChange} error={errors.department} required />
      </div>
      <Input label="Start Date" id="start_date" name="start_date" type="date" value={formData.start_date} onChange={handleChange} error={errors.start_date} required />
      <TextArea label="Description of Needs (e.g., computer, email, software)" id="description" name="description" value={formData.description} onChange={handleChange} error={errors.description} required rows={4} />
      <Button type="submit" isLoading={isLoading} className="w-full md:w-auto">
        Submit Request
      </Button>
    </form>
  );
};

export default UserRequestForm;
