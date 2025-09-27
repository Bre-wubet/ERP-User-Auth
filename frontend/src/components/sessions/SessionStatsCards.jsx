import React from 'react';
import { Smartphone, Monitor, CheckCircle, XCircle, Clock, Globe } from 'lucide-react';
import Card from '../ui/Card';

/**
 * Session Statistics Cards Component
 * Displays session statistics in a visual card format
 */
const SessionStatsCards = ({ sessions = [], currentSessionId = null }) => {
  const activeSessions = sessions.filter(session => session.isActive);
  const inactiveSessions = sessions.filter(session => !session.isActive);
  const mobileSessions = sessions.filter(session => 
    session.userAgent?.includes('Mobile') || 
    session.userAgent?.includes('Android') || 
    session.userAgent?.includes('iPhone')
  );
  const desktopSessions = sessions.filter(session => 
    !session.userAgent?.includes('Mobile') && 
    !session.userAgent?.includes('Android') && 
    !session.userAgent?.includes('iPhone')
  );

  const StatCard = ({ title, value, icon: Icon, color = 'forest', subtitle = null }) => (
    <Card className="p-6">
      <div className="flex items-center">
        <div className={`h-12 w-12 rounded-full bg-${color}-100 flex items-center justify-center mr-4`}>
          <Icon className={`h-6 w-6 text-${color}-600`} />
        </div>
        <div className="flex-1">
          <div className="text-sm font-medium text-sage-600">{title}</div>
          <div className={`text-2xl font-bold text-${color}-900`}>{value}</div>
          {subtitle && (
            <div className="text-xs text-sage-500">{subtitle}</div>
          )}
        </div>
      </div>
    </Card>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard
        title="Total Sessions"
        value={sessions.length}
        icon={Globe}
        color="forest"
        subtitle={`${activeSessions.length} active`}
      />
      <StatCard
        title="Active Sessions"
        value={activeSessions.length}
        icon={CheckCircle}
        color="moss"
        subtitle="Currently logged in"
      />
      <StatCard
        title="Mobile Devices"
        value={mobileSessions.length}
        icon={Smartphone}
        color="sage"
        subtitle={`${mobileSessions.filter(s => s.isActive).length} active`}
      />
      <StatCard
        title="Desktop/Laptop"
        value={desktopSessions.length}
        icon={Monitor}
        color="forest"
        subtitle={`${desktopSessions.filter(s => s.isActive).length} active`}
      />
    </div>
  );
};

export default SessionStatsCards;
