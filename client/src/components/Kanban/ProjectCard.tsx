import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Project } from '../../lib/types';
import { Figma, Globe, User } from 'lucide-react';

interface ProjectCardProps {
  project: Project;
  onClick: (project: Project) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onClick }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: project._id, data: { project } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const clientName = typeof project.client === 'object' && 'companyName' in project.client
    ? project.client.companyName
    : 'Unknown Client';

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`group bg-surface-800/80 border border-surface-700/30 rounded-xl p-4 hover:border-surface-600/50 hover:shadow-lg hover:shadow-black/20 transition-all duration-200 cursor-grab active:cursor-grabbing ${isDragging ? 'z-50 ring-2 ring-brand-500/50' : ''}`}
      onClick={() => {
        // Prevent click if we are dragging or just finished dragging
        if (isDragging) return;
        onClick(project);
      }}
    >
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-surface-100 truncate">{project.title}</h4>
        <p className="text-xs text-surface-500 mt-1 truncate">{clientName}</p>
      </div>

      <div className="flex items-center gap-2 mt-3 flex-wrap">
        {project.assets?.figmaLink && (
          <span className="flex items-center gap-1 text-[10px] text-violet-400 bg-violet-500/10 px-1.5 py-0.5 rounded">
            <Figma className="w-2.5 h-2.5" /> Figma
          </span>
        )}
        {project.developmentData?.domainUrl && (
          <span className="flex items-center gap-1 text-[10px] text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded">
            <Globe className="w-2.5 h-2.5" /> Live
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 mt-2.5">
        {project.designerId && (
          <div className="flex items-center gap-1 text-[10px] text-surface-500">
            <div className="w-4 h-4 rounded-full bg-violet-500/20 flex items-center justify-center">
              <User className="w-2.5 h-2.5 text-violet-400" />
            </div>
            <span className="truncate max-w-[60px]">
              {typeof project.designerId === 'object' ? project.designerId.name : ''}
            </span>
          </div>
        )}
        {project.developerId && (
          <div className="flex items-center gap-1 text-[10px] text-surface-500">
            <div className="w-4 h-4 rounded-full bg-cyan-500/20 flex items-center justify-center">
              <User className="w-2.5 h-2.5 text-cyan-400" />
            </div>
            <span className="truncate max-w-[60px]">
              {typeof project.developerId === 'object' ? project.developerId.name : ''}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectCard;
