import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '../components/Layout/Layout';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import api from '../lib/api';
import type { Client } from '../lib/types';
import { ArrowLeft, Plus, Building2, Mail, Phone, FileText, Loader2, ExternalLink } from 'lucide-react';

const ClientDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showNewProject, setShowNewProject] = useState(false);
  const [newProject, setNewProject] = useState({ title: '', driveLink: '' });

  const { data: client, isLoading } = useQuery<Client>({
    queryKey: ['client', id],
    queryFn: () => api.get(`/clients/${id}`).then((r) => r.data),
    enabled: !!id,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post(`/clients/${id}/projects`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client', id] });
      setShowNewProject(false);
      setNewProject({ title: '', driveLink: '' });
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({ title: newProject.title, assets: { driveLink: newProject.driveLink, figmaLink: '' } });
  };

  if (isLoading) {
    return (
      <Layout title="Client Details">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
        </div>
      </Layout>
    );
  }

  if (!client) {
    return <Layout title="Client Not Found"><p className="text-surface-500">Client not found.</p></Layout>;
  }

  const activeProjects = client.projects?.filter((p: any) => p.status !== 'COMPLETED') || [];
  const completedProjects = client.projects?.filter((p: any) => p.status === 'COMPLETED') || [];

  return (
    <Layout
      title={client.companyName}
      subtitle={client.contactName}
      actions={
        <div className="flex items-center gap-2 sm:gap-3">
          <button onClick={() => navigate('/clients')} className="btn-secondary flex items-center gap-2 whitespace-nowrap">
            <ArrowLeft className="w-4 h-4" /> <span className="hidden xs:inline">Back</span>
          </button>
          <button onClick={() => setShowNewProject(true)} className="btn-primary flex items-center gap-2 whitespace-nowrap">
            <Plus className="w-4 h-4" /> <span className="hidden xs:inline">New Project</span><span className="xs:hidden">New</span>
          </button>
        </div>
      }
    >
      {/* Client Info */}
      <div className="card p-5 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-2xl bg-brand-500/10 flex items-center justify-center">
            <Building2 className="w-7 h-7 text-brand-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">{client.companyName}</h2>
            <p className="text-sm text-surface-400">{client.contactName}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          {client.email && (
            <div className="flex items-center gap-2 text-surface-400">
              <Mail className="w-4 h-4 text-surface-600" /> {client.email}
            </div>
          )}
          {client.phone && (
            <div className="flex items-center gap-2 text-surface-400">
              <Phone className="w-4 h-4 text-surface-600" /> {client.phone}
            </div>
          )}
          {client.notes && (
            <div className="flex items-center gap-2 text-surface-400">
              <FileText className="w-4 h-4 text-surface-600" /> {client.notes}
            </div>
          )}
        </div>
      </div>

      {/* Active Projects */}
      <h3 className="text-base font-semibold text-white mb-3">Active Projects ({activeProjects.length})</h3>
      {activeProjects.length === 0 ? (
        <p className="text-sm text-surface-600 mb-6">No active projects for this client.</p>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 mb-6">
          {activeProjects.map((project: any) => (
            <div key={project._id} className="card p-4">
              <div className="flex items-start justify-between mb-2">
                <h4 className="text-sm font-semibold text-white">{project.title}</h4>
                <StatusBadge status={project.status} />
              </div>
              <div className="flex gap-2 mt-2">
                {project.assets?.figmaLink && (
                  <a href={project.assets.figmaLink} target="_blank" rel="noreferrer"
                    className="text-[10px] text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded flex items-center gap-1">
                    <ExternalLink className="w-2.5 h-2.5" /> Figma
                  </a>
                )}
                {project.developmentData?.domainUrl && (
                  <a href={project.developmentData.domainUrl} target="_blank" rel="noreferrer"
                    className="text-[10px] text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded flex items-center gap-1">
                    <ExternalLink className="w-2.5 h-2.5" /> Live
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Completed */}
      {completedProjects.length > 0 && (
        <>
          <h3 className="text-base font-semibold text-white mb-3">Completed ({completedProjects.length})</h3>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {completedProjects.map((project: any) => (
              <div key={project._id} className="card p-4 opacity-60">
                <div className="flex items-start justify-between">
                  <h4 className="text-sm font-medium text-surface-300">{project.title}</h4>
                  <StatusBadge status={project.status} />
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* New Project Modal */}
      <Modal isOpen={showNewProject} onClose={() => setShowNewProject(false)} title="New Project for Client">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="label-text">Project Title</label>
            <input className="input-field" value={newProject.title} onChange={(e) => setNewProject({ ...newProject, title: e.target.value })} required />
          </div>
          <div>
            <label className="label-text">Drive Link (optional)</label>
            <input className="input-field" value={newProject.driveLink} onChange={(e) => setNewProject({ ...newProject, driveLink: e.target.value })} />
          </div>
          <button type="submit" disabled={createMutation.isPending} className="w-full btn-primary flex items-center justify-center gap-2">
            {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Create Project
          </button>
        </form>
      </Modal>
    </Layout>
  );
};

export default ClientDetails;
