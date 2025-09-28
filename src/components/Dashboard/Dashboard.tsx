import React from 'react';
import { UserRole } from '../../types';
import { PMDashboard } from './PMDashboard';
import { DesignerDashboard } from './DesignerDashboard';
import { MarketingDashboard } from './MarketingDashboard';
import { DefaultDashboard } from './DefaultDashboard';

interface DashboardProps {
  userRole: UserRole;
  userName: string;
}

export const Dashboard: React.FC<DashboardProps> = ({ userRole, userName }) => {
  const getDashboardComponent = () => {
    switch (userRole) {
      case 'pm':
        return <PMDashboard userName={userName} />;
      case 'designer':
        return <DesignerDashboard userName={userName} />;
      case 'marketing':
        return <MarketingDashboard userName={userName} />;
      default:
        return <DefaultDashboard userName={userName} userRole={userRole} />;
    }
  };

  return (
    <div className="p-6">
      {getDashboardComponent()}
    </div>
  );
};