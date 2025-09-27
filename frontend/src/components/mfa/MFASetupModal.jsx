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

          {/* Important Note */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <div className="h-5 w-5 text-blue-600 mr-3 mt-0.5">ℹ️</div>
              <div>
                <h4 className="text-sm font-medium text-blue-800 mb-1">Important Note</h4>
                <p className="text-sm text-blue-700">
                  The QR code contains a special URL that only authenticator apps can read. 
                  If you click on it in your browser, you'll see an error - this is normal! 
                  Use your authenticator app to scan the QR code instead.
                </p>
              </div>
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
                  <li>2. Open your authenticator app and tap "Add Account" or "+"</li>
                  <li>3. Choose "Scan QR Code" and scan the code below</li>
                  <li>4. Enter the 6-digit code from your app to verify</li>
                  <li>5. Save your backup codes in a secure location</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Alternative Setup Method */}
          <div className="bg-forest-50 border border-forest-200 rounded-lg p-4">
            <div className="flex items-start">
              <QrCode className="h-5 w-5 text-forest-600 mr-3 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-forest-800 mb-2">Can't Scan QR Code?</h4>
                <p className="text-sm text-forest-700 mb-2">
                  If you can't scan the QR code, you can manually enter the secret key:
                </p>
                <div className="bg-white border border-forest-200 rounded p-2 mb-2">
                  <code className="text-xs text-forest-800 break-all">
                    {mfaSecret}
                  </code>
                </div>
                <p className="text-xs text-forest-600">
                  In your authenticator app, choose "Enter a setup key" and paste this secret.
                </p>
              </div>
            </div>
          </div>

          {/* QR Code Section */}
          {qrCodeUrl && (
            <div className="text-center">
              <div className="inline-block p-4 bg-white border border-sage-200 rounded-lg shadow-sm">
                <img 
                  src={qrCodeUrl} 
                  alt="MFA QR Code" 
                  className="w-48 h-48"
                />
              </div>
              <div className="mt-4 space-y-2">
                <p className="text-sm text-sage-600">
                  Scan this QR code with your authenticator app
                </p>
                <div className="flex items-center justify-center space-x-4">
                  <button
                    onClick={() => navigator.clipboard.writeText(mfaSecret)}
                    className="text-xs text-forest-600 hover:text-forest-700 underline"
                  >
                    Copy Secret Key
                  </button>
                  <span className="text-xs text-sage-400">•</span>
                  <button
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = qrCodeUrl;
                      link.download = 'mfa-qr-code.png';
                      link.click();
                    }}
                    className="text-xs text-forest-600 hover:text-forest-700 underline"
                  >
                    Download QR Code
                  </button>
                </div>
              </div>
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
