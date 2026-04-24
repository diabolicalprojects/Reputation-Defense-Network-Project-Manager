import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Layout from '../components/Layout/Layout';
import Board from '../components/Kanban/Board';
import Modal from '../components/Modal';
import api from '../lib/api';
import type { Project, User, Client, Settings } from '../lib/types';
import { Plus, Loader2 } from 'lucide-react';
import { useProjectMutations } from '../hooks/useProjectMutations';
import { CreateProjectForm } from '../features/projects/CreateProjectForm';
import { ProjectDetailsView } from '../features/projects/ProjectDetailsView';

const DashboardPM: React.FC = () => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showNewProject, setShowNewProject] = useState(false);

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => api.get('/projects').then((r) => r.data),
  });

  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ['clients'],
    queryFn: () => api.get('/clients').then((r) => r.data),
  });

  const { data: designers = [] } = useQuery<User[]>({
    queryKey: ['users', 'DESIGNER'],
    queryFn: () => api.get('/users/role/DESIGNER').then((r) => r.data),
  });

  const { data: developers = [] } = useQuery<User[]>({
    queryKey: ['users', 'DEVELOPER'],
    queryFn: () => api.get('/users/role/DEVELOPER').then((r) => r.data),
  });

  const { data: settings } = useQuery<Settings>({
    queryKey: ['settings'],
    queryFn: () => api.get('/settings').then((r) => r.data),
  });

  const { createMutation, updateMutation } = useProjectMutations();

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
  };

  const handleCreateProject = (data: any) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        setShowNewProject(false);
      }
    });
  };

  const handleUpdateProject = (id: string, data: any) => {
    updateMutation.mutate({ id, data }, {
      onSuccess: () => {
        setSelectedProject(null);
      }
    });
  };

  if (isLoading) {
    return (
      <Layout title="Dashboard">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      title="Project Pipeline"
      subtitle={`${projects.length} active projects`}
      actions={
        <button onClick={() => setShowNewProject(true)} className="btn-primary flex items-center gap-2 whitespace-nowrap">
          <Plus className="w-4 h-4" /> <span className="hidden xs:inline">New Project</span><span className="xs:hidden">New</span>
        </button>
      }
    >
      <Board projects={projects} onProjectClick={handleProjectClick} />

      {/* New Project Modal */}
      <Modal isOpen={showNewProject} onClose={() => setShowNewProject(false)} title="New Project">
        <CreateProjectForm
          clients={clients}
          settings={settings}
          onSubmit={handleCreateProject}
          isPending={createMutation.isPending}
        />
      </Modal>

      {/* Project Detail Modal */}
      <Modal isOpen={!!selectedProject} onClose={() => setSelectedProject(null)} title={selectedProject?.title || ''}>
        {selectedProject && (
          <ProjectDetailsView
            project={selectedProject}
            designers={designers}
            developers={developers}
            settings={settings}
            isPending={updateMutation.isPending}
            onSave={handleUpdateProject}
          />
        )}
      </Modal>
    </Layout>
  );
};

export default DashboardPM;
