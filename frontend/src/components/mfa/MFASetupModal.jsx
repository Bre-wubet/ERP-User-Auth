import React from 'react';
import { Shield, QrCode, Smartphone } from 'lucide-react';
import Modal from '../ui/Modal';
import Card from '../ui/Card';
import { MFASetupForm } from '../auth/MFASharedComponents';

/**
 * MFA Setup Modal Component
 * Handles MFA setup with QR code scanning
 */
const MFASetupModal = ({ 
  isOpen, 
  onClose, 
  mfaSecret,
  qrCodeUrl,
  onSubmit,
  loading = false 
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Setup Multi-Factor Authentication"
      size="lg"
    >
      <Card>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center mb-6">
            <div className="h-10 w-10 rounded-full bg-forest-100 flex items-center justify-center mr-3">
              <Shield className="h-5 w-5 text-forest-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-forest-900">Setup MFA</h3>
              <p className="text-sm text-sage-600">
                Follow these steps to enable multi-factor authentication
              </p>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-sage-50 border border-sage-200 rounded-lg p-4">
            <div className="flex items-start">
              <Smartphone className="h-5 w-5 text-sage-600 mr-3 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-sage-800 mb-2">Setup Instructions</h4>
                <ol className="text-sm text-sage-700 space-y-1">
                  <li>1. Install an authenticator app on your mobile device</li>
                  <li>2. Scan the QR code below with your authenticator app</li>
                  <li>3. Enter the 6-digit code from your app to verify</li>
                  <li>4. Save your backup codes in a secure location</li>
                </ol>
              </div>
            </div>
          </div>

          {/* QR Code Section */}
          {qrCodeUrl && (
            <div className="text-center">
              <div className="inline-block p-4 bg-white border border-sage-200 rounded-lg">
                <img 
                  src={qrCodeUrl} 
                  alt="MFA QR Code" 
                  className="w-48 h-48"
                />
              </div>
              <p className="text-sm text-sage-600 mt-2">
                Scan this QR code with your authenticator app
              </p>
            </div>
          )}

          {/* Setup Form */}
          <MFASetupForm
            mfaSecret={mfaSecret}
            qrCodeUrl={qrCodeUrl}
            onSubmit={onSubmit}
            onCancel={onClose}
            loading={loading}
          />
        </div>
      </Card>
    </Modal>
  );
};

export default MFASetupModal;
