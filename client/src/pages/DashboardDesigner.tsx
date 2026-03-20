import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Layout from '../components/Layout/Layout';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import api from '../lib/api';
import type { Project } from '../lib/types';
import { useAuth } from '../context/AuthContext';
import { Palette, ExternalLink, Send, Loader2, Inbox, FileText, CheckCircle2, Circle } from 'lucide-react';
import { useProjectMutations } from '../hooks/useProjectMutations';

const DashboardDesigner: React.FC = () => {
  const { user } = useAuth();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [figmaLink, setFigmaLink] = useState('');

  const { data: allProjects = [], isLoading } = useQuery<Project[]>({
    queryKey: ['my-projects'],
    queryFn: () => api.get('/projects/mine').then((r) => r.data),
  });

  const projects = allProjects.filter((p: Project) => {
    const designerId = typeof p.designerId === 'object' ? p.designerId?._id : p.designerId;
    return designerId === user?.id;
  });

  const { updateMutation, statusMutation, sopMutation } = useProjectMutations();

  const allSopCompleted = (project: Project) =>
    project.designerSop && project.designerSop.length > 0 && project.designerSop.every((t) => t.isCompleted);

  const handleOpenProject = (project: Project) => {
    setSelectedProject(project);
    setFigmaLink(project.assets?.figmaLink || '');
  };

  const handleSubmitDesign = async () => {
    if (!selectedProject || !figmaLink || !allSopCompleted(selectedProject)) return;
    try {
      await updateMutation.mutateAsync({
        id: selectedProject._id,
        data: {
          assets: {
            figmaLink,
            driveLink: selectedProject.assets?.driveLink || '',
          },
        },
      });
      await statusMutation.mutateAsync({
        id: selectedProject._id,
        status: 'DESIGN_REVIEW',
      });
      setSelectedProject(null);
      setFigmaLink('');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to submit');
    }
  };

  if (isLoading) {
    return (
      <Layout title="Design Queue">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Design Queue" subtitle={`${projects.length} active project${projects.length !== 1 ? 's' : ''}`}>
      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-surface-500">
          <Inbox className="w-16 h-16 mb-4 text-surface-700" />
          <p className="text-lg font-medium">No active projects</p>
          <p className="text-sm mt-1">Your design queue is empty. Check back later!</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => {
            const clientName = typeof project.client === 'object' && 'companyName' in project.client
              ? project.client.companyName : 'Client';
            return (
              <div
                key={project._id}
                onClick={() => handleOpenProject(project)}
                className="card-hover group p-5 cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center group-hover:bg-violet-500/20 transition-colors">
                    <Palette className="w-5 h-5 text-violet-400" />
                  </div>
                  <StatusBadge status={project.status} />
                </div>
                <h3 className="text-base font-semibold text-white mb-1">{project.title}</h3>
                <p className="text-sm text-surface-500">{clientName}</p>
                {project.assets?.driveLink && (
                  <a
                    href={project.assets.driveLink}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1.5 text-xs text-brand-400 hover:text-brand-300 mt-3 font-medium"
                  >
                    <ExternalLink className="w-3 h-3" /> Drive Folder
                  </a>
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
            <div className="flex gap-3">
              {selectedProject.assets?.driveLink && (
                <a href={selectedProject.assets.driveLink} target="_blank" rel="noreferrer"
                  className="flex items-center gap-1.5 text-xs text-brand-400 bg-brand-500/10 px-3 py-1.5 rounded-lg hover:bg-brand-500/20 transition-colors font-medium">
                  <ExternalLink className="w-3.5 h-3.5" /> Open Drive
                </a>
              )}
            </div>

            {/* Designer SOP Checklist */}
            {selectedProject.designerSop && selectedProject.designerSop.length > 0 && (
              <div className="p-3 bg-surface-900/50 rounded-xl border border-surface-700/30">
                <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-2">Design SOP Tasks</p>
                <div className="space-y-1.5 max-h-[150px] overflow-y-auto pr-1">
                  {selectedProject.designerSop.map((task) => (
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
                      disabled={selectedProject.status !== 'DESIGN'}
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

            {/* Figma Link Submission */}
            {selectedProject.status === 'DESIGN' && (
              <div className="p-4 bg-violet-500/5 border border-violet-500/20 rounded-xl space-y-3">
                <p className="text-xs font-semibold text-violet-300 uppercase tracking-wider">Submit Design</p>
                <div className="space-y-1">
                  <label className="text-[10px] text-surface-500 uppercase font-bold">Figma Link</label>
                  <input
                    className="input-field"
                    value={figmaLink}
                    onChange={(e) => setFigmaLink(e.target.value)}
                    placeholder="https://www.figma.com/file/..."
                  />
                </div>
                <button
                  onClick={handleSubmitDesign}
                  disabled={!figmaLink || updateMutation.isPending || statusMutation.isPending || !allSopCompleted(selectedProject)}
                  className="w-full btn-primary flex items-center justify-center gap-2 py-3"
                >
                  {(updateMutation.isPending || statusMutation.isPending) ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Submit for Review
                </button>
              </div>
            )}

            {selectedProject.status === 'DESIGN_REVIEW' && (
              <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-center">
                <p className="text-sm font-semibold text-amber-300">Design Submitted</p>
                <p className="text-xs text-amber-500/70 mt-1">Waiting for PM review and approval.</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </Layout>
  );
};

export default DashboardDesigner;
