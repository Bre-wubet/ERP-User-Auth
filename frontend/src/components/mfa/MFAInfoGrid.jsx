import React from 'react';
import { Smartphone, Key, AlertTriangle, Shield, Download, Copy, CheckCircle } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { MFAInfoCard } from '../auth/MFASharedComponents';

/**
 * MFA Information Grid Component
 * Displays MFA information cards in a grid layout
 */
const MFAInfoGrid = ({ 
  isMFAEnabled, 
  onViewBackupCodes 
}) => {
  return (
    <div className="space-y-6">
      {/* Main Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MFAInfoCard title="Authenticator Apps" icon={Smartphone}>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-forest-900 mb-2">Supported Apps</h4>
              <ul className="text-sm text-sage-600 space-y-1">
                <li>• Google Authenticator</li>
                <li>• Microsoft Authenticator</li>
                <li>• Authy</li>
                <li>• 1Password</li>
                <li>• LastPass Authenticator</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-forest-900 mb-2">How it works</h4>
              <p className="text-sm text-sage-600">
                When you sign in, you'll be asked for a 6-digit code from your authenticator app. 
                This adds an extra layer of security to your account.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-forest-900 mb-2">Setup Process</h4>
              <ol className="text-sm text-sage-600 space-y-1">
                <li>1. Install an authenticator app on your phone</li>
                <li>2. Scan the QR code or enter the secret key manually</li>
                <li>3. Enter the 6-digit code to verify setup</li>
                <li>4. Save your backup codes securely</li>
              </ol>
            </div>
          </div>
        </MFAInfoCard>

        <MFAInfoCard title="Backup Codes" icon={Key}>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-forest-900 mb-2">What are backup codes?</h4>
              <p className="text-sm text-sage-600">
                Backup codes are one-time use codes that can be used to access your account 
                if you lose access to your authenticator app.
              </p>
            </div>
            {isMFAEnabled && (
              <div className="space-y-3">
                <div className="bg-moss-50 border border-moss-200 rounded-lg p-3">
                  <div className="flex items-center mb-2">
                    <CheckCircle className="h-4 w-4 text-moss-600 mr-2" />
                    <span className="text-sm font-medium text-moss-800">Status: Active</span>
                  </div>
                  <p className="text-xs text-moss-700">
                    You have backup codes available for emergency access
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={onViewBackupCodes}
                  icon={<Key className="h-4 w-4" />}
                >
                  View Backup Codes
                </Button>
              </div>
            )}
          </div>
        </MFAInfoCard>
      </div>

      {/* Security Tips */}
      <MFAInfoCard title="Security Tips" icon={AlertTriangle}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-forest-900 mb-3">Best Practices</h4>
            <ul className="text-sm text-sage-600 space-y-2">
              <li>• Keep your authenticator app updated</li>
              <li>• Store backup codes in a secure location</li>
              <li>• Don't share your backup codes with anyone</li>
              <li>• Use a different device for backup codes</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-forest-900 mb-3">What to do if you lose access</h4>
            <ul className="text-sm text-sage-600 space-y-2">
              <li>• Use your backup codes to sign in</li>
              <li>• Contact support if you've lost backup codes</li>
              <li>• Re-enable MFA after regaining access</li>
              <li>• Generate new backup codes</li>
            </ul>
          </div>
        </div>
      </MFAInfoCard>

      {/* MFA Activity Section - Only show when MFA is enabled */}
      {isMFAEnabled && (
        <MFAInfoCard title="Recent MFA Activity" icon={Shield}>
          <div className="space-y-4">
            <div className="bg-forest-50 border border-forest-200 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <CheckCircle className="h-5 w-5 text-forest-600 mr-2" />
                <h4 className="text-sm font-medium text-forest-800">Last Login</h4>
              </div>
              <div className="text-sm text-forest-700">
                <p>✓ MFA verification successful</p>
                <p className="text-xs text-forest-600 mt-1">Today at {new Date().toLocaleTimeString()}</p>
              </div>
            </div>
            
            <div className="bg-sage-50 border border-sage-200 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <Shield className="h-5 w-5 text-sage-600 mr-2" />
                <h4 className="text-sm font-medium text-sage-800">Security Status</h4>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-sage-700">Authenticator:</span>
                  <span className="ml-2 text-forest-600 font-medium">Active</span>
                </div>
                <div>
                  <span className="text-sage-700">Backup Codes:</span>
                  <span className="ml-2 text-forest-600 font-medium">Available</span>
                </div>
              </div>
            </div>
          </div>
        </MFAInfoCard>
      )}

      {/* Troubleshooting Section */}
      <MFAInfoCard title="Troubleshooting" icon={AlertTriangle}>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-forest-900 mb-2">QR Code Issues</h4>
            <ul className="text-sm text-sage-600 space-y-1">
              <li>• QR code shows "web page not available" - this is normal!</li>
              <li>• Use your authenticator app to scan, not your browser</li>
              <li>• If scanning fails, use the manual secret key method</li>
              <li>• Make sure your authenticator app is up to date</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-forest-900 mb-2">Common Problems</h4>
            <ul className="text-sm text-sage-600 space-y-1">
              <li>• Codes not working - check if your phone's time is correct</li>
              <li>• App not generating codes - try restarting the app</li>
              <li>• Lost phone - use backup codes to regain access</li>
              <li>• Still having issues - contact support for help</li>
            </ul>
          </div>
        </div>
      </MFAInfoCard>

      {/* Additional Security Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-4">
          <div className="flex items-center mb-3">
            <div className="h-8 w-8 rounded-full bg-moss-100 flex items-center justify-center mr-3">
              <Shield className="h-4 w-4 text-moss-600" />
            </div>
            <h4 className="font-medium text-forest-900">Enhanced Security</h4>
          </div>
          <p className="text-sm text-sage-600">
            MFA adds an extra layer of protection beyond just your password, 
            making your account significantly more secure.
          </p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center mb-3">
            <div className="h-8 w-8 rounded-full bg-forest-100 flex items-center justify-center mr-3">
              <Download className="h-4 w-4 text-forest-600" />
            </div>
            <h4 className="font-medium text-forest-900">Easy Setup</h4>
          </div>
          <p className="text-sm text-sage-600">
            Setting up MFA is quick and easy. Just scan a QR code with your 
            authenticator app and you're protected.
          </p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center mb-3">
            <div className="h-8 w-8 rounded-full bg-sage-100 flex items-center justify-center mr-3">
              <Copy className="h-4 w-4 text-sage-600" />
            </div>
            <h4 className="font-medium text-forest-900">Backup Options</h4>
          </div>
          <p className="text-sm text-sage-600">
            If you lose access to your authenticator app, backup codes provide 
            a way to regain access to your account.
          </p>
        </Card>
      </div>
    </div>
  );
};

export default MFAInfoGrid;
