import React, { useState } from 'react';
import { Modal } from './ui/Modal';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Globe, Plus } from 'lucide-react';

export const AddDomainModal = ({ isOpen, onClose, onSave }) => {
  const [urlInput, setUrlInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!urlInput.trim()) {
      setError('Please enter a website URL or domain name');
      return;
    }

    setError('');
    setIsSubmitting(true);
    try {
      await onSave(urlInput.trim());
      setUrlInput('');
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save domain');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Save Website Domain">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Website URL or Domain"
          placeholder="e.g. github.com or https://react.dev/learn"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          icon={Globe}
          error={error}
          helperText="Metadata (title, description, icon) will be automatically extracted."
          autoFocus
        />

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
          <Button variant="ghost" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting} leftIcon={Plus}>
            Save Domain
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddDomainModal;
