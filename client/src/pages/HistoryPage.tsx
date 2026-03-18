import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout/Layout';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import api from '../lib/api';
import type { Project } from '../lib/types';
import { 
  Loader2,
  CheckCircle2, 
  Calendar, 
  Globe, 
  ExternalLink, 
  FileText,
  Palette,
  Code2,
  ChevronRight,
  Key
} from 'lucide-react';

const HistoryPage: React.FC = () => {
  const { user } = useAuth();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  
  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: ['projects-history'],
    queryFn: () => api.get('/projects').then((r) => r.data),
  });

  const completed = projects.filter((p) => p.status === 'COMPLETED');

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <Layout title="History">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Project History" subtitle={`${completed.length} completed projects`}>
      {completed.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-surface-500 card border-dashed">
          <CheckCircle2 className="w-16 h-16 mb-4 text-surface-700 opacity-20" />
          <p className="text-lg font-medium text-surface-400">No completed projects yet</p>
          <p className="text-sm mt-1">Projects will appear here once they are moved to the Completed column.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {completed.map((project) => {
            return (
              <div 
                key={project._id} 
                className="card group hover:border-brand-500/40 transition-all duration-300 flex flex-col p-0 overflow-hidden"
              >
                {/* Header Section */}
                <div className="p-5 border-b border-surface-800/50 bg-surface-900/30">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-white truncate pr-4 group-hover:text-brand-400 transition-colors">
                      {project.title}
                    </h3>
                    <StatusBadge status={project.status} />
                  </div>
                  <div className="flex items-center gap-2 text-surface-400 text-sm">
                    {project.developmentData?.domainUrl ? (
                      <span className="truncate flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-brand-500/70" />
                        {project.developmentData.domainUrl.replace(/^https?:\/\//, '')}
                      </span>
                    ) : (
                      <span className="text-surface-600 italic">No domain linked</span>
                    )}
                  </div>
                </div>

                {/* Info Section */}
                <div className="p-5 flex-1 space-y-4">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded-lg bg-surface-800 flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-brand-400" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase font-bold text-surface-500 tracking-wider">Created</span>
                      <span className="text-surface-200">{formatDate(project.createdAt)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded-lg bg-surface-800 flex items-center justify-center">
                      <Palette className="w-4 h-4 text-violet-400" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase font-bold text-surface-500 tracking-wider">Designer</span>
                      <span className="text-surface-200">
                        {project.designerId?.name || 'Unassigned'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded-lg bg-surface-800 flex items-center justify-center">
                      <Code2 className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase font-bold text-surface-500 tracking-wider">Developer</span>
                      <span className="text-surface-200">
                        {project.developerId?.name || 'Unassigned'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded-lg bg-surface-800 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase font-bold text-surface-500 tracking-wider">Completed</span>
                      <span className="text-surface-200">{formatDate(project.completedAt || project.updatedAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Section */}
                <div className="px-5 py-4 bg-surface-900/50 border-t border-surface-800/50">
                  <button 
                    onClick={() => setSelectedProject(project)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-surface-800 border border-surface-700 text-surface-200 text-sm font-semibold hover:bg-surface-700 hover:border-surface-600 active:scale-95 transition-all group/btn"
                  >
                    View Details
                    <ChevronRight className="w-4 h-4 text-surface-500 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      <Modal 
        isOpen={!!selectedProject} 
        onClose={() => setSelectedProject(null)} 
        title={selectedProject?.title || 'Project Details'}
      >
        {selectedProject && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <StatusBadge status={selectedProject.status} />
              <div className="flex items-center gap-2 text-xs text-surface-500">
                <Calendar className="w-3.5 h-3.5" />
                Completed on {formatDate(selectedProject.completedAt || selectedProject.updatedAt)}
              </div>
            </div>

            {/* Notes Section */}
            {selectedProject.notes && (
              <div className="p-4 bg-surface-900/50 rounded-xl border border-surface-700/30">
                <div className="flex items-center gap-2 mb-2 text-brand-400">
                  <FileText className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Project Notes</span>
                </div>
                <p className="text-sm text-surface-300 whitespace-pre-wrap">{selectedProject.notes}</p>
              </div>
            )}

            {/* Access Links */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {selectedProject.assets?.figmaLink && (
                <a href={selectedProject.assets.figmaLink} target="_blank" rel="noreferrer"
                  className="flex items-center justify-center gap-2 text-xs text-violet-400 bg-violet-500/10 p-3 rounded-xl border border-violet-500/20 hover:bg-violet-500/20 transition-all">
                  <ExternalLink className="w-4 h-4" /> Figma Project
                </a>
              )}
              {selectedProject.assets?.driveLink && (
                <a href={selectedProject.assets.driveLink} target="_blank" rel="noreferrer"
                  className="flex items-center justify-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20 hover:bg-emerald-500/20 transition-all">
                  <ExternalLink className="w-4 h-4" /> Google Drive
                </a>
              )}
              {selectedProject.developmentData?.domainUrl && (
                <a href={selectedProject.developmentData.domainUrl} target="_blank" rel="noreferrer"
                  className="flex items-center justify-center gap-2 text-xs text-cyan-400 bg-cyan-500/10 p-3 rounded-xl border border-cyan-500/20 hover:bg-cyan-500/20 transition-all sm:col-span-2">
                  <Globe className="w-4 h-4" /> Live Site
                </a>
              )}
            </div>

            {/* WP Credentials - Visible to DEVELOPER, PM, BOTH */}
            {(user?.role === 'DEVELOPER' || user?.role === 'PM' || user?.role === 'BOTH') && 
             (selectedProject.developmentData?.wpAdminUser || selectedProject.developmentData?.wpAdminPassword) && (
              <div className="p-4 bg-surface-900 border border-surface-700/50 rounded-xl">
                 <div className="flex items-center gap-2 mb-3 text-brand-400">
                  <Key className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Access Credentials</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] text-surface-500 uppercase font-medium">Username</span>
                    <p className="text-sm text-surface-200">{selectedProject.developmentData.wpAdminUser || 'N/A'}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-surface-500 uppercase font-medium">Password</span>
                    <p className="text-sm text-surface-200">{selectedProject.developmentData.wpAdminPassword || 'N/A'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* SOP Review */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Designer SOP - Visible to DESIGNER, PM, BOTH */}
              {(user?.role === 'DESIGNER' || user?.role === 'PM' || user?.role === 'BOTH') && 
               selectedProject.designerSop?.length > 0 && (
                <div className="p-4 bg-violet-500/5 rounded-xl border border-violet-500/20">
                  <p className="text-[10px] font-bold text-violet-400 uppercase tracking-widest mb-3">Design SOP</p>
                  <div className="space-y-2">
                    {selectedProject.designerSop.map((task: any) => (
                      <div key={task._id} className="flex items-center gap-2 text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                        <span className="text-surface-400 line-through">{task.task}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Developer SOP - Visible to DEVELOPER, PM, BOTH */}
              {(user?.role === 'DEVELOPER' || user?.role === 'PM' || user?.role === 'BOTH') && 
               selectedProject.developerSop?.length > 0 && (
                <div className="p-4 bg-cyan-500/5 rounded-xl border border-cyan-500/20">
                  <p className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest mb-3">Developer SOP</p>
                  <div className="space-y-2">
                    {selectedProject.developerSop.map((task: any) => (
                      <div key={task._id} className="flex items-center gap-2 text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                        <span className="text-surface-400 line-through">{task.task}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Assignment Info */}
            <div className="flex flex-col gap-3 pt-4 border-t border-surface-700/50">
              {selectedProject.designerId && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-surface-500">Designer Assigned:</span>
                  <span className="text-surface-200 font-semibold">{selectedProject.designerId.name}</span>
                </div>
              )}
              {selectedProject.developerId && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-surface-500">Developer Assigned:</span>
                  <span className="text-surface-200 font-semibold">{selectedProject.developerId.name}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </Layout>
  );
};

export default HistoryPage;
