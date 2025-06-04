
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as requestService from '../../services/requestService';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { TextArea } from '../common/TextArea';
import { useNotifications } from '../../hooks/useNotifications';

const EquipmentRequestForm: React.FC = () => {
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  const [formData, setFormData] = useState({
    name: '',
    event: '',
    date: '', // YYYY-MM-DD
    time: '',
    location: '',
    equipment: '',
    description: '',
    return_date: '', // YYYY-MM-DD
    return_time: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Requester name is required.';
    if (!formData.event.trim()) newErrors.event = 'Event name is required.';
    if (!formData.date) newErrors.date = 'Event date is required.';
    if (!formData.time) newErrors.time = 'Event time is required.';
    if (!formData.location.trim()) newErrors.location = 'Location is required.';
    if (!formData.equipment.trim()) newErrors.equipment = 'Equipment details are required.';
    if (!formData.description.trim()) newErrors.description = 'Description is required.';
    if (!formData.return_date) newErrors.return_date = 'Return date is required.';
    if (!formData.return_time) newErrors.return_time = 'Return time is required.';
    
    if (formData.date && formData.return_date && new Date(formData.return_date) < new Date(formData.date)) {
        newErrors.return_date = 'Return date cannot be before the event date.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await requestService.createEquipmentRequest(formData);
      addNotification('Equipment request submitted successfully!', 'success');
      navigate('/requests/equipment');
    } catch (err: any) {
      addNotification(err.message || 'Failed to submit equipment request', 'error');
      // if (err.errors) setErrors(prev => ({ ...prev, ...err.errors }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input label="Your Name" id="name" name="name" value={formData.name} onChange={handleChange} error={errors.name} required />
        <Input label="Event Name" id="event" name="event" value={formData.event} onChange={handleChange} error={errors.event} required />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input label="Event Date" id="date" name="date" type="date" value={formData.date} onChange={handleChange} error={errors.date} required />
        <Input label="Event Time" id="time" name="time" type="time" value={formData.time} onChange={handleChange} error={errors.time} required />
      </div>
      <Input label="Location of Event" id="location" name="location" value={formData.location} onChange={handleChange} error={errors.location} required />
      <TextArea label="Equipment Needed" id="equipment" name="equipment" value={formData.equipment} onChange={handleChange} error={errors.equipment} required rows={3} />
      <TextArea label="Brief Description of Event/Need" id="description" name="description" value={formData.description} onChange={handleChange} error={errors.description} required rows={4} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input label="Return Date" id="return_date" name="return_date" type="date" value={formData.return_date} onChange={handleChange} error={errors.return_date} required />
        <Input label="Return Time" id="return_time" name="return_time" type="time" value={formData.return_time} onChange={handleChange} error={errors.return_time} required />
      </div>
      <Button type="submit" isLoading={isLoading} className="w-full md:w-auto">
        Submit Request
      </Button>
    </form>
  );
};

export default EquipmentRequestForm;
