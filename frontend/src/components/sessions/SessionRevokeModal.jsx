import React from 'react';
import { Trash2, AlertTriangle, Smartphone, Monitor, MapPin, Clock, X } from 'lucide-react';
import Modal from '../ui/Modal';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { format } from 'date-fns';

/**
 * Session Revoke Modal Component
 * Handles session revocation with confirmation
 */
const SessionRevokeModal = ({ 
  isOpen, 
  onClose, 
  session,
  onConfirm,
  loading = false 
}) => {
  if (!session) return null;

  const getDeviceIcon = (userAgent) => {
    if (userAgent.includes('Mobile') || userAgent.includes('Android') || userAgent.includes('iPhone')) {
      return Smartphone;
    }
    return Monitor;
  };

  const DeviceIcon = getDeviceIcon(session.userAgent || '');

  const handleConfirm = () => {
    onConfirm(session);
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Revoke Session"
      size="md"
    >
      <Card>
        <div className="flex items-center mb-6">
          <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center mr-3">
            <Trash2 className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-forest-900">Revoke Session</h3>
            <p className="text-sm text-sage-600">
              This will immediately log out the selected device
            </p>
          </div>
        </div>

        {/* Warning */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-red-600 mr-3 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-red-800">Confirm Session Revocation</h4>
              <p className="text-sm text-red-700 mt-1">
                This will immediately log out the selected device. The user will need to 
                sign in again to access their account from this device.
              </p>
            </div>
          </div>
        </div>

        {/* Session Information */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center p-3 bg-sage-50 rounded-lg">
            <div className="h-8 w-8 rounded-full bg-forest-100 flex items-center justify-center mr-3">
              <DeviceIcon className="h-4 w-4 text-forest-600" />
            </div>
            <div>
              <div className="font-medium text-forest-900">
                {session.deviceName || 'Unknown Device'}
              </div>
              <div className="text-sm text-sage-600">
                {session.userAgent?.includes('Mobile') || session.userAgent?.includes('Android') || session.userAgent?.includes('iPhone') 
                  ? 'Mobile Device' 
                  : 'Desktop/Laptop'
                }
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center">
              <MapPin className="h-4 w-4 text-sage-400 mr-3" />
              <div>
                <div className="text-sm font-medium text-forest-900">Location</div>
                <div className="text-sm text-sage-600">
                  {session.location || 'Unknown Location'}
                </div>
              </div>
            </div>

            <div className="flex items-center">
              <Clock className="h-4 w-4 text-sage-400 mr-3" />
              <div>
                <div className="text-sm font-medium text-forest-900">IP Address</div>
                <div className="text-sm text-sage-600 font-mono">
                  {session.ip || 'Unknown'}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center">
            <Clock className="h-4 w-4 text-sage-400 mr-3" />
            <div>
              <div className="text-sm font-medium text-forest-900">Last Activity</div>
              <div className="text-sm text-sage-600">
                {session.lastActivityAt 
                  ? format(new Date(session.lastActivityAt), 'PPpp')
                  : 'Never'
                }
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={loading}
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleConfirm}
            loading={loading}
            disabled={loading}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Revoke Session
          </Button>
        </div>
      </Card>
    </Modal>
  );
};

export default SessionRevokeModal;
