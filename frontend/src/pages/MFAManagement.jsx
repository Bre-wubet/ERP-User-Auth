import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import MFAHeader from '../components/mfa/MFAHeader';
import MFAInfoGrid from '../components/mfa/MFAInfoGrid';
import MFASetupModal from '../components/mfa/MFASetupModal';
import MFABackupCodesModal from '../components/mfa/MFABackupCodesModal';
import MFADisableModal from '../components/mfa/MFADisableModal';
import { MFAStatusCard } from '../components/auth/MFASharedComponents';
import toast from 'react-hot-toast';

/**
 * MFA Management Page - Refactored
 * Comprehensive Multi-Factor Authentication management with modular components
 */
const MFAManagement = () => {
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [showBackupCodesModal, setShowBackupCodesModal] = useState(false);
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [mfaSecret, setMfaSecret] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [backupCodes, setBackupCodes] = useState([]);

  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Fetch user profile to get MFA status
  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ['user-profile'],
    queryFn: authAPI.getProfile,
  });

  const userProfile = profileData?.data?.data || profileData?.data;
  const isMFAEnabled = userProfile?.mfaEnabled || false;

  // Setup MFA mutation
  const setupMFAMutation = useMutation({
    mutationFn: authAPI.setupMFA,
    onSuccess: (response) => {
      console.log('MFA Setup Response:', response);
      const mfaData = response.data?.data || response.data;
      console.log('MFA Data:', mfaData);
      const { secret, qrCodeUrl } = mfaData;
      setMfaSecret(secret);
      setQrCodeUrl(qrCodeUrl);
      setShowSetupModal(true);
      toast.success('MFA setup initiated. Please scan the QR code.');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to setup MFA');
    },
  });

  // Enable MFA mutation
  const enableMFAMutation = useMutation({
    mutationFn: authAPI.enableMFA,
    onSuccess: (response) => {
      console.log('MFA Enable Success Response:', response);
      queryClient.invalidateQueries(['user-profile']);
      setShowSetupModal(false);
      const codes = response?.data?.data?.backupCodes || [];
      if (codes.length > 0) {
        setBackupCodes(codes);
        setShowBackupCodesModal(true);
      }
      toast.success('MFA enabled successfully');
    },
    onError: (error) => {
      console.error('MFA Enable Error:', error);
      console.error('Error Response:', error.response);
      toast.error(error.response?.data?.message || 'Failed to enable MFA');
    },
  });

  // Disable MFA mutation
  const disableMFAMutation = useMutation({
    mutationFn: authAPI.disableMFA,
    onSuccess: () => {
      queryClient.invalidateQueries(['user-profile']);
      setShowDisableModal(false);
      toast.success('MFA disabled successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to disable MFA');
    },
  });

  // Event handlers
  const handleSetupMFA = () => {
    setupMFAMutation.mutate();
  };

  const handleEnableMFA = (data) => {
    console.log('handleEnableMFA called with data:', data);
    console.log('mfaSecret:', mfaSecret);
    console.log('Sending request with:', { token: data.token, secret: mfaSecret });
    enableMFAMutation.mutate({ token: data.token, secret: mfaSecret });
  };

  const handleDisableMFA = (data) => {
    disableMFAMutation.mutate({ token: data.token });
  };

  const handleViewBackupCodes = () => {
    setShowBackupCodesModal(true);
  };

  const closeModals = () => {
    setShowSetupModal(false);
    setShowBackupCodesModal(false);
    setShowDisableModal(false);
    setMfaSecret('');
    setQrCodeUrl('');
    setBackupCodes([]);
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-sage-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forest-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sage-50 py-8">
      <div className="max-w-7xl mx-auto sm:px-2 lg:px-0">
        {/* Header */}
        <MFAHeader
          isMFAEnabled={isMFAEnabled}
          onSetupMFA={handleSetupMFA}
          setupLoading={setupMFAMutation.isPending}
        />

        {/* MFA Status Card */}
        <div className="mb-6">
          <MFAStatusCard
            isEnabled={isMFAEnabled}
            onSetup={handleSetupMFA}
            onDisable={() => setShowDisableModal(true)}
            onViewBackupCodes={handleViewBackupCodes}
            setupLoading={setupMFAMutation.isPending}
            disableLoading={disableMFAMutation.isPending}
          />
        </div>

        {/* MFA Information Grid */}
        <MFAInfoGrid
          isMFAEnabled={isMFAEnabled}
          onViewBackupCodes={handleViewBackupCodes}
        />

        {/* Modals */}
        <MFASetupModal
          isOpen={showSetupModal}
          onClose={closeModals}
          mfaSecret={mfaSecret}
          qrCodeUrl={qrCodeUrl}
          onSubmit={handleEnableMFA}
          loading={enableMFAMutation.isPending}
        />

        <MFABackupCodesModal
          isOpen={showBackupCodesModal}
          onClose={closeModals}
          codes={backupCodes}
          userEmail={user?.email}
        />

        <MFADisableModal
          isOpen={showDisableModal}
          onClose={closeModals}
          onSubmit={handleDisableMFA}
          loading={disableMFAMutation.isPending}
        />
      </div>
    </div>
  );
};

export default MFAManagement;