import React, { useState } from 'react';
import { 
  Smartphone, 
  Monitor, 
  MapPin, 
  Clock, 
  Calendar, 
  Globe, 
  Eye, 
  EyeOff,
  CheckCircle,
  XCircle
} from 'lucide-react';
import Modal from '../ui/Modal';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { format } from 'date-fns';

/**
 * Session Details Modal Component
 * Displays detailed information about a specific session
 */
const SessionDetailsModal = ({ 
  isOpen, 
  onClose, 
  session 
}) => {
  const [showUserAgent, setShowUserAgent] = useState(false);

  if (!session) return null;

  const getDeviceIcon = (userAgent) => {
    if (userAgent.includes('Mobile') || userAgent.includes('Android') || userAgent.includes('iPhone')) {
      return Smartphone;
    }
    return Monitor;
  };

  const getDeviceInfo = (userAgent) => {
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Unknown Browser';
  };

  const getOSInfo = (userAgent) => {
    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Mac')) return 'macOS';
    if (userAgent.includes('Linux')) return 'Linux';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('iPhone') || userAgent.includes('iPad')) return 'iOS';
    return 'Unknown OS';
  };

  const DeviceIcon = getDeviceIcon(session.userAgent || '');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Session Details"
      size="lg"
    >
      <div className="space-y-6">
        {/* Header Info */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-12 w-12 rounded-full bg-forest-100 flex items-center justify-center mr-4">
                <DeviceIcon className="h-6 w-6 text-forest-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-forest-900">
                  {session.deviceName || 'Unknown Device'}
                </h3>
                <p className="text-sage-600">
                  {getOSInfo(session.userAgent || '')} • {getDeviceInfo(session.userAgent || '')}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                session.isActive 
                  ? 'bg-moss-100 text-moss-800' 
                  : 'bg-sage-100 text-sage-800'
              }`}>
                {session.isActive ? (
                  <>
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Active
                  </>
                ) : (
                  <>
                    <XCircle className="h-3 w-3 mr-1" />
                    Inactive
                  </>
                )}
              </span>
            </div>
          </div>
        </Card>

        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-4">
            <h4 className="text-lg font-semibold text-forest-900 mb-4">Device Information</h4>
            <div className="space-y-3">
              <div className="flex items-center">
                <DeviceIcon className="h-4 w-4 text-sage-400 mr-3" />
                <div>
                  <div className="text-sm font-medium text-forest-900">Device Type</div>
                  <div className="text-sm text-sage-600">
                    {session.userAgent?.includes('Mobile') || session.userAgent?.includes('Android') || session.userAgent?.includes('iPhone') 
                      ? 'Mobile Device' 
                      : 'Desktop/Laptop'
                    }
                  </div>
                </div>
              </div>
              <div className="flex items-center">
                <Monitor className="h-4 w-4 text-sage-400 mr-3" />
                <div>
                  <div className="text-sm font-medium text-forest-900">Operating System</div>
                  <div className="text-sm text-sage-600">{getOSInfo(session.userAgent || '')}</div>
                </div>
              </div>
              <div className="flex items-center">
                <Globe className="h-4 w-4 text-sage-400 mr-3" />
                <div>
                  <div className="text-sm font-medium text-forest-900">Browser</div>
                  <div className="text-sm text-sage-600">{getDeviceInfo(session.userAgent || '')}</div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <h4 className="text-lg font-semibold text-forest-900 mb-4">Location Information</h4>
            <div className="space-y-3">
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
                <Globe className="h-4 w-4 text-sage-400 mr-3" />
                <div>
                  <div className="text-sm font-medium text-forest-900">IP Address</div>
                  <div className="text-sm text-sage-600 font-mono">
                    {session.ip || 'Unknown'}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Time Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-4">
            <h4 className="text-lg font-semibold text-forest-900 mb-4">Session Timeline</h4>
            <div className="space-y-3">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 text-sage-400 mr-3" />
                <div>
                  <div className="text-sm font-medium text-forest-900">Session Created</div>
                  <div className="text-sm text-sage-600">
                    {format(new Date(session.createdAt), 'PPpp')}
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
          </Card>

          <Card className="p-4">
            <h4 className="text-lg font-semibold text-forest-900 mb-4">Session Status</h4>
            <div className="space-y-3">
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-sage-400 mr-3" />
                <div>
                  <div className="text-sm font-medium text-forest-900">Status</div>
                  <div className="text-sm text-sage-600">
                    {session.isActive ? 'Active' : 'Inactive'}
                  </div>
                </div>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 text-sage-400 mr-3" />
                <div>
                  <div className="text-sm font-medium text-forest-900">Session Duration</div>
                  <div className="text-sm text-sage-600">
                    {session.lastActivityAt 
                      ? `${Math.floor((new Date(session.lastActivityAt) - new Date(session.createdAt)) / (1000 * 60 * 60))} hours`
                      : 'Unknown'
                    }
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Technical Details */}
        <Card className="p-4">
          <h4 className="text-lg font-semibold text-forest-900 mb-4">Technical Details</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-forest-700 mb-2">User Agent</label>
              <div className="bg-sage-50 border border-sage-200 rounded-md p-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-sage-700 font-mono">
                    {showUserAgent ? session.userAgent : 'Click to reveal technical details'}
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowUserAgent(!showUserAgent)}
                    icon={showUserAgent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  >
                    {showUserAgent ? 'Hide' : 'Show'}
                  </Button>
                </div>
              </div>
            </div>

            {session.sessionData && (
              <div>
                <label className="block text-sm font-medium text-forest-700 mb-2">Session Data</label>
                <div className="bg-sage-50 border border-sage-200 rounded-md p-3">
                  <pre className="text-sm text-sage-700 whitespace-pre-wrap">
                    {JSON.stringify(session.sessionData, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Actions */}
        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default SessionDetailsModal;
