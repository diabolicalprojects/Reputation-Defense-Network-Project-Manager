import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Layout from '../components/Layout/Layout';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import api from '../lib/api';
import type { Project } from '../lib/types';
import { Code2, ExternalLink, Eye, EyeOff, Send, Loader2, Inbox, CheckCircle2, Circle, Copy, Check, FileText } from 'lucide-react';
import { useProjectMutations } from '../hooks/useProjectMutations';
import { copyToClipboard, getWpAdminUrl } from '../lib/utils';

const DashboardDeveloper: React.FC = () => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: ['my-projects'],
    queryFn: () => api.get('/projects/mine').then((r) => r.data),
  });

  const { sopMutation, statusMutation } = useProjectMutations();

  const handleSubmit = () => {
    if (!selectedProject) return;
    statusMutation.mutate(
      { id: selectedProject._id, status: 'INTERNAL_REVIEW' },
      {
        onSuccess: () => {
          setSelectedProject(null);
        },
        onError: (error: any) => {
          alert(error.response?.data?.message || 'Failed to submit');
        },
      }
    );
  };

  const allSopCompleted = (project: Project) =>
    project.developerSop && project.developerSop.length > 0 && project.developerSop.every((t) => t.isCompleted);

  const handleCopy = async (text: string, field: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  if (isLoading) {
    return (
      <Layout title="Dev Queue">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Dev Queue" subtitle={`${projects.length} active project${projects.length !== 1 ? 's' : ''}`}>
      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-surface-500">
          <Inbox className="w-16 h-16 mb-4 text-surface-700" />
          <p className="text-lg font-medium">No active projects</p>
          <p className="text-sm mt-1">Your development queue is empty. Check back later!</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => {
            const clientName = typeof project.client === 'object' && 'companyName' in project.client
              ? project.client.companyName : 'Client';
            const sopCount = project.developerSop?.length || 0;
            const sopProgress = sopCount > 0
              ? Math.round((project.developerSop!.filter((t) => t.isCompleted).length / sopCount) * 100)
              : 100;
            return (
              <div key={project._id} onClick={() => setSelectedProject(project)} className="card-hover group p-5 cursor-pointer">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center group-hover:bg-cyan-500/20 transition-colors">
                    <Code2 className="w-5 h-5 text-cyan-400" />
                  </div>
                  <StatusBadge status={project.status} />
                </div>
                <h3 className="text-base font-semibold text-white mb-1">{project.title}</h3>
                <p className="text-sm text-surface-500 mb-3">{clientName}</p>
                {/* SOP Progress Bar */}
                {sopCount > 0 && (
                  <div>
                    <div className="flex items-center justify-between text-[10px] text-surface-500 mb-1">
                      <span>Developer SOP</span>
                      <span>{sopProgress}%</span>
                    </div>
                    <div className="h-1.5 bg-surface-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${sopProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Modal isOpen={!!selectedProject} onClose={() => setSelectedProject(null)} title={selectedProject?.title || ''}>
        {selectedProject && (
          <div className="space-y-4">
            <StatusBadge status={selectedProject.status} />

            {/* Notes */}
            {selectedProject.notes && (
              <div className="p-3 bg-brand-500/5 border border-brand-500/20 rounded-xl">
                <div className="flex items-center gap-2 mb-1 text-brand-400">
                  <FileText className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Project Notes</span>
                </div>
                <p className="text-xs text-surface-400 whitespace-pre-wrap">{selectedProject.notes}</p>
              </div>
            )}

            {/* Links */}
            <div className="flex gap-3 flex-wrap">
              {selectedProject.assets?.figmaLink && (
                <a href={selectedProject.assets.figmaLink} target="_blank" rel="noreferrer"
                  className="flex items-center gap-1.5 text-xs text-violet-400 bg-violet-500/10 px-3 py-1.5 rounded-lg hover:bg-violet-500/20 transition-colors font-medium">
                  <ExternalLink className="w-3 h-3" /> Figma Review
                </a>
              )}
              {selectedProject.developmentData?.domainUrl && (
                <a href={getWpAdminUrl(selectedProject.developmentData.domainUrl)} target="_blank" rel="noreferrer"
                  className="flex items-center gap-1.5 text-xs text-cyan-400 bg-cyan-500/10 px-3 py-1.5 rounded-lg hover:bg-cyan-500/20 transition-colors font-medium">
                  <ExternalLink className="w-3 h-3" /> WP Admin
                </a>
              )}
            </div>

            {/* WP Credentials */}
            <div className="p-3 bg-surface-900/50 rounded-xl border border-surface-700/30 space-y-3">
              <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider">WordPress Access</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <span className="text-[10px] text-surface-600 uppercase font-bold">Username</span>
                  <div className="flex items-center justify-between bg-surface-900 p-2 rounded border border-surface-700">
                    <p className="text-surface-300 text-xs truncate">{selectedProject.developmentData?.wpAdminUser}</p>
                    <button onClick={() => handleCopy(selectedProject.developmentData?.wpAdminUser || '', 'user')} className="p-1 hover:text-white transition-colors">
                      {copiedField === 'user' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-surface-600 uppercase font-bold">Password</span>
                  <div className="flex items-center justify-between bg-surface-900 p-2 rounded border border-surface-700">
                    <p className="text-surface-300 text-xs font-mono">
                      {showPassword ? selectedProject.developmentData?.wpAdminPassword : '••••••••••'}
                    </p>
                    <div className="flex items-center gap-1">
                      <button onClick={() => setShowPassword(!showPassword)} className="p-1 hover:text-white transition-colors">
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                      <button onClick={() => handleCopy(selectedProject.developmentData?.wpAdminPassword || '', 'pass')} className="p-1 hover:text-white transition-colors">
                        {copiedField === 'pass' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive SOP Checklist */}
            {selectedProject.developerSop && selectedProject.developerSop.length > 0 && (
              <div className="p-3 bg-surface-900/50 rounded-xl border border-surface-700/30">
                <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-2">Developer SOP Tasks</p>
                <div className="space-y-1.5 max-h-[200px] overflow-y-auto pr-1">
                  {selectedProject.developerSop.map((task) => (
                    <button
                      key={task._id}
                      onClick={() =>
                        sopMutation.mutate({
                          projectId: selectedProject._id,
                          taskId: task._id,
                          isCompleted: !task.isCompleted,
                        }, {
                          onSuccess: (response: any) => {
                            if (selectedProject?._id === response.data._id) {
                              setSelectedProject(response.data);
                            }
                          }
                        })
                      }
                      disabled={selectedProject.status !== 'DEVELOPMENT'}
                      className="w-full flex items-center gap-2.5 text-sm p-2 rounded-lg hover:bg-surface-800 transition-colors text-left disabled:opacity-50"
                    >
                      {task.isCompleted ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-surface-600 flex-shrink-0" />
                      )}
                      <span className={task.isCompleted ? 'text-surface-500 line-through' : 'text-surface-300'}>
                        {task.task}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Submit Button */}
            {selectedProject.status === 'DEVELOPMENT' && (
              <button
                onClick={handleSubmit}
                disabled={!allSopCompleted(selectedProject) || statusMutation.isPending}
                className="w-full btn-primary flex items-center justify-center gap-2 py-3"
              >
                {statusMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Submit for Internal Review
              </button>
            )}

            {selectedProject.status === 'INTERNAL_REVIEW' && (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-sm font-semibold text-emerald-400">Development Submitted</p>
                <p className="text-xs text-emerald-500/70 mt-1">Waiting for PM final verification.</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </Layout>
  );
};

export default DashboardDeveloper;
