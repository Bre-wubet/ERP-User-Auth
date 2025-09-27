import React from 'react';
import { Shield, Smartphone } from 'lucide-react';
import Button from '../ui/Button';

/**
 * MFA Header Component
 * Displays the page header with setup button
 */
const MFAHeader = ({ 
  isMFAEnabled, 
  onSetupMFA, 
  setupLoading = false 
}) => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="h-12 w-12 rounded-full bg-forest-100 flex items-center justify-center mr-4">
            <Shield className="h-6 w-6 text-forest-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-forest-900">Multi-Factor Authentication</h1>
            <p className="text-sage-600 mt-1">
              Manage your account security with MFA
            </p>
          </div>
        </div>
        {!isMFAEnabled && (
          <Button
            onClick={onSetupMFA}
            icon={<Shield className="h-5 w-5" />}
            loading={setupLoading}
            size="lg"
          >
            Setup MFA
          </Button>
        )}
      </div>
    </div>
  );
};

export default MFAHeader;
