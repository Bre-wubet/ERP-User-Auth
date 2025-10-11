import React, { useState } from 'react';
import { useNotifications } from '../../context/NotificationContext';
import { 
  Bell, 
  BellOff, 
  Mail, 
  Smartphone, 
  Shield, 
  Settings, 
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Save,
  RotateCcw
} from 'lucide-react';
import Button from '../ui/Button';
import Modal from '../ui/Modal';

/**
 * Notification Preferences Component
 * Allows users to configure their notification preferences
 */
const NotificationPreferences = ({ isOpen, onClose }) => {
  const { preferences, updatePreferences } = useNotifications();
  const [localPreferences, setLocalPreferences] = useState(preferences);
  const [hasChanges, setHasChanges] = useState(false);

  React.useEffect(() => {
    setLocalPreferences(preferences);
    setHasChanges(false);
  }, [preferences, isOpen]);

  const handlePreferenceChange = (key, value) => {
    const newPreferences = { ...localPreferences, [key]: value };
    setLocalPreferences(newPreferences);
    setHasChanges(true);
  };

  const handleSave = () => {
    updatePreferences(localPreferences);
    setHasChanges(false);
    onClose();
  };

  const handleReset = () => {
    setLocalPreferences(preferences);
    setHasChanges(false);
  };

  const handleCancel = () => {
    setLocalPreferences(preferences);
    setHasChanges(false);
    onClose();
  };

  const preferenceOptions = [
    {
      key: 'emailNotifications',
      label: 'Email Notifications',
      description: 'Receive notifications via email',
      icon: Mail,
      category: 'general'
    },
    {
      key: 'pushNotifications',
      label: 'Push Notifications',
      description: 'Receive browser push notifications',
      icon: Smartphone,
      category: 'general'
    },
    {
      key: 'securityAlerts',
      label: 'Security Alerts',
      description: 'Critical security events and warnings',
      icon: Shield,
      category: 'security'
    },
    {
      key: 'systemUpdates',
      label: 'System Updates',
      description: 'System maintenance and updates',
      icon: Settings,
      category: 'system'
    },
    {
      key: 'userActivity',
      label: 'User Activity',
      description: 'General user activity notifications',
      icon: Info,
      category: 'activity'
    },
  ];

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'security':
        return <Shield className="h-5 w-5 text-red-500" />;
      case 'system':
        return <Settings className="h-5 w-5 text-blue-500" />;
      case 'activity':
        return <Info className="h-5 w-5 text-green-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getCategoryTitle = (category) => {
    switch (category) {
      case 'security':
        return 'Security & Safety';
      case 'system':
        return 'System & Maintenance';
      case 'activity':
        return 'User Activity';
      default:
        return 'General';
    }
  };

  const groupedPreferences = preferenceOptions.reduce((acc, pref) => {
    if (!acc[pref.category]) {
      acc[pref.category] = [];
    }
    acc[pref.category].push(pref);
    return acc;
  }, {});

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      title="Notification Preferences"
      size="lg"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex items-start">
            <Bell className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-blue-800">Notification Settings</h3>
              <p className="text-sm text-blue-700 mt-1">
                Configure how you want to receive notifications. You can customize different types of notifications based on your preferences.
              </p>
            </div>
          </div>
        </div>

        {/* Preferences by Category */}
        {Object.entries(groupedPreferences).map(([category, prefs]) => (
          <div key={category} className="space-y-4">
            <div className="flex items-center space-x-2">
              {getCategoryIcon(category)}
              <h4 className="text-lg font-medium text-gray-900">
                {getCategoryTitle(category)}
              </h4>
            </div>
            
            <div className="space-y-3">
              {prefs.map((pref) => {
                const Icon = pref.icon;
                return (
                  <div
                    key={pref.key}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-white rounded-md">
                        <Icon className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <h5 className="text-sm font-medium text-gray-900">
                          {pref.label}
                        </h5>
                        <p className="text-sm text-gray-600">
                          {pref.description}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {localPreferences[pref.key] ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-gray-400" />
                      )}
                      <button
                        onClick={() => handlePreferenceChange(pref.key, !localPreferences[pref.key])}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          localPreferences[pref.key] ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            localPreferences[pref.key] ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Quick Actions */}
        <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Quick Actions</h4>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => {
                const allEnabled = Object.keys(localPreferences).reduce((acc, key) => {
                  acc[key] = true;
                  return acc;
                }, {});
                setLocalPreferences(allEnabled);
                setHasChanges(true);
              }}
              className="flex items-center justify-center px-3 py-2 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-md hover:bg-green-100 transition-colors"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Enable All
            </button>
            <button
              onClick={() => {
                const allDisabled = Object.keys(localPreferences).reduce((acc, key) => {
                  acc[key] = false;
                  return acc;
                }, {});
                setLocalPreferences(allDisabled);
                setHasChanges(true);
              }}
              className="flex items-center justify-center px-3 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 transition-colors"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Disable All
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            {hasChanges && (
              <span className="text-sm text-gray-500 flex items-center">
                <AlertTriangle className="h-4 w-4 mr-1" />
                You have unsaved changes
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={!hasChanges}
              icon={<RotateCcw className="h-4 w-4" />}
            >
              Reset
            </Button>
            <Button
              variant="outline"
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!hasChanges}
              icon={<Save className="h-4 w-4" />}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default NotificationPreferences;
