
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as requestService from '../../services/requestService';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { TextArea } from '../common/TextArea';
import { Select } from '../common/Select';
import { useNotifications } from '../../hooks/useNotifications';

const GRADE_LEVELS = ['Kindergarten', '1st Grade', '2nd Grade', '3rd Grade', '4th Grade', '5th Grade', '6th Grade', '7th Grade', '8th Grade', 'Other'];

const StudentRequestForm: React.FC = () => {
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  const [formData, setFormData] = useState({
    fname: '',
    lname: '',
    grade: GRADE_LEVELS[0],
    teacher: '',
    description: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const gradeOptions = GRADE_LEVELS.map(g => ({ value: g, label: g }));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.fname.trim()) newErrors.fname = 'First name is required.';
    if (!formData.lname.trim()) newErrors.lname = 'Last name is required.';
    if (!formData.grade) newErrors.grade = 'Grade level is required.';
    if (!formData.teacher.trim()) newErrors.teacher = "Teacher's name is required.";
    if (!formData.description.trim()) newErrors.description = 'Description of needs is required.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await requestService.createStudentRequest(formData);
      addNotification('New student request submitted successfully!', 'success');
      navigate('/requests/students');
    } catch (err: any) {
      addNotification(err.message || 'Failed to submit new student request', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input label="Student's First Name" id="fname" name="fname" value={formData.fname} onChange={handleChange} error={errors.fname} required />
        <Input label="Student's Last Name" id="lname" name="lname" value={formData.lname} onChange={handleChange} error={errors.lname} required />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Select label="Grade Level" id="grade" name="grade" options={gradeOptions} value={formData.grade} onChange={handleChange} error={errors.grade} required />
        <Input label="Teacher's Name" id="teacher" name="teacher" value={formData.teacher} onChange={handleChange} error={errors.teacher} required />
      </div>
      <TextArea label="Description of Needs (e.g., new account, device setup)" id="description" name="description" value={formData.description} onChange={handleChange} error={errors.description} required rows={4} />
      <Button type="submit" isLoading={isLoading} className="w-full md:w-auto">
        Submit Request
      </Button>
    </form>
  );
};

export default StudentRequestForm;