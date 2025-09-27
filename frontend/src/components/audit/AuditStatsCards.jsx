import React from 'react';
import { FileText, Activity, User, AlertTriangle, TrendingUp, Clock } from 'lucide-react';
import Card from '../ui/Card';

/**
 * Audit Statistics Cards Component
 * Displays audit statistics in a visual card format
 */
const AuditStatsCards = ({ stats = {} }) => {
  const StatCard = ({ title, value, icon: Icon, color = 'forest', trend = null }) => (
    <Card className="p-6">
      <div className="flex items-center">
        <div className={`h-12 w-12 rounded-full bg-${color}-100 flex items-center justify-center mr-4`}>
          <Icon className={`h-6 w-6 text-${color}-600`} />
        </div>
        <div className="flex-1">
          <div className="text-sm font-medium text-sage-600">{title}</div>
          <div className={`text-2xl font-bold text-${color}-900`}>{value}</div>
          {trend && (
            <div className={`text-xs ${trend > 0 ? 'text-moss-600' : trend < 0 ? 'text-red-600' : 'text-sage-600'}`}>
              {trend > 0 ? '↗' : trend < 0 ? '↘' : '→'} {Math.abs(trend)}% from last period
            </div>
          )}
        </div>
      </div>
    </Card>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard
        title="Total Logs"
        value={stats.totalLogs || 0}
        icon={FileText}
        color="forest"
        trend={stats.logsTrend}
      />
      <StatCard
        title="Today's Activity"
        value={stats.todayLogs || 0}
        icon={Activity}
        color="moss"
        trend={stats.todayTrend}
      />
      <StatCard
        title="Active Users"
        value={stats.activeUsers || 0}
        icon={User}
        color="sage"
        trend={stats.usersTrend}
      />
      <StatCard
        title="Security Events"
        value={stats.securityEvents || 0}
        icon={AlertTriangle}
        color="red"
        trend={stats.securityTrend}
      />
    </div>
  );
};

export default AuditStatsCards;
