import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { Project, ProjectStatus } from '../../lib/types';
import { STATUS_LABELS } from '../../lib/types';
import ProjectCard from './ProjectCard';

interface ColumnProps {
  status: ProjectStatus;
  projects: Project[];
  onProjectClick: (project: Project) => void;
}

const COLUMN_COLORS: Record<ProjectStatus, string> = {
  NEW: 'from-surface-500 to-surface-600',
  DESIGN: 'from-violet-500 to-violet-600',
  DESIGN_REVIEW: 'from-amber-500 to-amber-600',
  DEVELOPMENT: 'from-cyan-500 to-cyan-600',
  INTERNAL_REVIEW: 'from-orange-500 to-orange-600',
  COMPLETED: 'from-emerald-500 to-emerald-600',
};

const Column: React.FC<ColumnProps> = ({ status, projects, onProjectClick }) => {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div className="flex flex-col min-w-[280px] max-w-[280px]">
      {/* Column Header */}
      <div className="flex items-center gap-2.5 mb-3 px-1">
        <div className={`w-2.5 h-2.5 rounded-full bg-gradient-to-br ${COLUMN_COLORS[status]} shadow-lg`} />
        <h3 className="text-sm font-semibold text-surface-300">{STATUS_LABELS[status]}</h3>
        <span className="ml-auto text-xs text-surface-600 bg-surface-800 px-2 py-0.5 rounded-full font-medium">
          {projects.length}
        </span>
      </div>

      {/* Cards Container */}
      <div
        ref={setNodeRef}
        className={`flex-1 rounded-xl p-2 space-y-2 min-h-[200px] transition-colors duration-200 ${
          isOver ? 'bg-brand-500/5 border-2 border-dashed border-brand-500/30' : 'bg-surface-900/30 border-2 border-transparent'
        }`}
      >
        <SortableContext items={projects.map((p) => p._id)} strategy={verticalListSortingStrategy}>
          {projects.map((project) => (
            <ProjectCard key={project._id} project={project} onClick={onProjectClick} />
          ))}
        </SortableContext>
        {projects.length === 0 && (
          <div className="flex items-center justify-center h-24 text-xs text-surface-600">
            No projects
          </div>
        )}
      </div>
    </div>
  );
};

export default Column;
