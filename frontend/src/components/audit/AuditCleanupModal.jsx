import React from 'react';
import { useForm } from 'react-hook-form';
import { Trash2, AlertTriangle, Calendar, Save, X } from 'lucide-react';
import Modal from '../ui/Modal';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';

/**
 * Audit Cleanup Modal Component
 * Handles cleanup of old audit logs
 */
const AuditCleanupModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  loading = false 
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm({
    defaultValues: {
      daysToKeep: 90
    }
  });

  const daysToKeep = watch('daysToKeep');

  const handleFormSubmit = (data) => {
    onSubmit(data);
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Cleanup Old Audit Logs"
      size="md"
    >
      <Card>
        <div className="flex items-center mb-6">
          <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center mr-3">
            <Trash2 className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-forest-900">Cleanup Old Logs</h3>
            <p className="text-sm text-sage-600">
              Remove audit logs older than the specified number of days
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <div>
            <Input
              label="Days to Keep"
              type="number"
              min="1"
              max="365"
              placeholder="Enter number of days"
              error={errors.daysToKeep?.message}
              required
              {...register('daysToKeep', {
                required: 'Days to keep is required',
                min: {
                  value: 1,
                  message: 'Must keep at least 1 day of logs'
                },
                max: {
                  value: 365,
                  message: 'Cannot keep more than 365 days of logs'
                }
              })}
            />
            <p className="text-xs text-sage-500 mt-1">
              Audit logs older than {daysToKeep} days will be permanently deleted
            </p>
          </div>

          {/* Warning */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-yellow-800">Warning</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  This action cannot be undone. All audit logs older than {daysToKeep} days will be permanently deleted from the system.
                </p>
              </div>
            </div>
          </div>

          {/* Estimated Impact */}
          <div className="bg-sage-50 border border-sage-200 rounded-lg p-4">
            <div className="flex items-start">
              <Calendar className="h-5 w-5 text-sage-600 mr-3 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-sage-800">Estimated Impact</h4>
                <p className="text-sm text-sage-700 mt-1">
                  This will remove audit logs created before {new Date(Date.now() - (daysToKeep * 24 * 60 * 60 * 1000)).toLocaleDateString()}.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={loading}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              variant="danger"
              loading={loading}
              disabled={loading}
            >
              <Save className="h-4 w-4 mr-2" />
              Cleanup Logs
            </Button>
          </div>
        </form>
      </Card>
    </Modal>
  );
};

export default AuditCleanupModal;
