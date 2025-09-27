import React from 'react';
import { Key, Download, Copy, AlertTriangle, CheckCircle } from 'lucide-react';
import Modal from '../ui/Modal';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { BackupCodesDisplay } from '../auth/MFASharedComponents';

/**
 * MFA Backup Codes Modal Component
 * Displays and manages backup codes
 */
const MFABackupCodesModal = ({ 
  isOpen, 
  onClose, 
  codes = [],
  userEmail = ''
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Your MFA Backup Codes"
      size="lg"
    >
      <Card>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center mb-6">
            <div className="h-10 w-10 rounded-full bg-moss-100 flex items-center justify-center mr-3">
              <Key className="h-5 w-5 text-moss-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-forest-900">Backup Codes</h3>
              <p className="text-sm text-sage-600">
                Save these codes in a secure location
              </p>
            </div>
          </div>

          {/* Warning */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-yellow-800">Important Security Notice</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  These backup codes are your only way to access your account if you lose your authenticator app. 
                  Store them in a secure location and don't share them with anyone.
                </p>
              </div>
            </div>
          </div>

          {/* Success Message */}
          <div className="bg-moss-50 border border-moss-200 rounded-lg p-4">
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-moss-600 mr-3 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-moss-800">MFA Successfully Enabled</h4>
                <p className="text-sm text-moss-700 mt-1">
                  Your multi-factor authentication is now active. You'll need to use your authenticator app 
                  or backup codes to sign in from now on.
                </p>
              </div>
            </div>
          </div>

          {/* Backup Codes Display */}
          <BackupCodesDisplay
            codes={codes}
            onClose={onClose}
            userEmail={userEmail}
          />
        </div>
      </Card>
    </Modal>
  );
};

export default MFABackupCodesModal;
