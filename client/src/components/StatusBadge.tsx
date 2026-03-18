import React from 'react';
import type { ProjectStatus } from '../lib/types';
import { STATUS_LABELS } from '../lib/types';

interface StatusBadgeProps {
  status: ProjectStatus;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const classMap: Record<ProjectStatus, string> = {
    NEW: 'badge-new',
    DESIGN: 'badge-design',
    DESIGN_REVIEW: 'badge-design-review',
    DEVELOPMENT: 'badge-development',
    INTERNAL_REVIEW: 'badge-internal-review',
    COMPLETED: 'badge-completed',
  };

  return <span className={classMap[status]}>{STATUS_LABELS[status]}</span>;
};

export default StatusBadge;
