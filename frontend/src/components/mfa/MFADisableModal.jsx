import React from 'react';
import { Shield, AlertTriangle, X } from 'lucide-react';
import Modal from '../ui/Modal';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { DisableMFAForm } from '../auth/MFASharedComponents';

/**
 * MFA Disable Modal Component
 * Handles MFA disabling with confirmation
 */
const MFADisableModal = ({ 
  isOpen, 
  onClose, 
  onSubmit,
  loading = false 
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Disable Multi-Factor Authentication"
      size="md"
    >
      <Card>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center mb-6">
            <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center mr-3">
              <Shield className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-forest-900">Disable MFA</h3>
              <p className="text-sm text-sage-600">
                This will remove the extra security layer from your account
              </p>
            </div>
          </div>

          {/* Warning */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-red-600 mr-3 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-red-800">Security Warning</h4>
                <p className="text-sm text-red-700 mt-1">
                  Disabling MFA will make your account less secure. Anyone with your password 
                  will be able to access your account. We strongly recommend keeping MFA enabled.
                </p>
              </div>
            </div>
          </div>

          {/* Alternative Security Options */}
          <div className="bg-sage-50 border border-sage-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-sage-800 mb-2">Consider These Alternatives</h4>
            <ul className="text-sm text-sage-700 space-y-1">
              <li>• Update your password to a stronger one</li>
              <li>• Enable MFA on a different device</li>
              <li>• Contact support if you're having issues</li>
              <li>• Use backup codes if you lost your authenticator</li>
            </ul>
          </div>

          {/* Disable Form */}
          <DisableMFAForm
            onSubmit={onSubmit}
            onCancel={onClose}
            loading={loading}
          />
        </div>
      </Card>
    </Modal>
  );
};

export default MFADisableModal;
