
import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { TextArea } from '../common/TextArea';
import { Button } from '../common/Button';
import * as generalService from '../../services/generalService';
import { useNotifications } from '../../hooks/useNotifications';

const ReportBugModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState(''); // e.g., page or feature name
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string,string>>({});
  const { addNotification } = useNotifications();

  const validate = (): boolean => {
    const newErrors: Record<string,string> = {};
    if(!title.trim()) newErrors.title = "Title is required.";
    if(!description.trim()) newErrors.description = "Description is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  const handleSubmit = async () => {
    if(!validate()) return;

    setIsLoading(true);
    try {
      await generalService.reportBug({ title, description, location });
      addNotification('Bug report submitted successfully. Thank you!', 'success');
      setTitle('');
      setDescription('');
      setLocation('');
      onClose();
    } catch (err: any) {
      addNotification(err.message || 'Failed to submit bug report.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Report a Bug / Provide Feedback">
      <div className="space-y-4">
        <Input
          label="Title / Subject"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Button not working on Tickets page"
          error={errors.title}
          required
        />
        <TextArea
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Please provide as much detail as possible, including steps to reproduce."
          rows={5}
          error={errors.description}
          required
        />
        <Input
          label="Location in App (Optional)"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="e.g., Dashboard, Ticket Creation Form"
        />
        <div className="flex justify-end space-x-2 pt-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} isLoading={isLoading}>Submit Report</Button>
        </div>
      </div>
    </Modal>
  );
};

export default ReportBugModal;
