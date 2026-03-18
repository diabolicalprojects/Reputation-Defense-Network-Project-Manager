import React, { useState } from 'react';
import {
  DndContext,
  type DragEndEvent,
  type DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Project, ProjectStatus } from '../../lib/types';
import { STATUS_ORDER } from '../../lib/types';
import Column from './Column';
import Modal from '../Modal';
import api from '../../lib/api';

interface BoardProps {
  projects: Project[];
  onProjectClick: (project: Project) => void;
}

const Board: React.FC<BoardProps> = ({ projects, onProjectClick }) => {
  const queryClient = useQueryClient();
  const [rejectDialog, setRejectDialog] = useState<{
    isOpen: boolean;
    projectId: string;
    projectTitle: string;
    newStatus: ProjectStatus;
  } | null>(null);
  const [rejectNotes, setRejectNotes] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const statusMutation = useMutation({
    mutationFn: ({ id, status, notes }: { id: string; status: string; notes?: string }) =>
      api.patch(`/projects/${id}/status`, { status, notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setRejectDialog(null);
      setRejectNotes('');
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || 'Failed to update status';
      alert(msg);
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  // Group projects by status
  const grouped = STATUS_ORDER.reduce((acc, status) => {
    acc[status] = projects.filter((p) => p.status === status);
    return acc;
  }, {} as Record<ProjectStatus, Project[]>);

  const handleDragStart = (_event: DragStartEvent) => {
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const projectId = active.id as string;
    const overId = over.id as string;

    // Check if dropped on a column (status) or another card
    let newStatus: ProjectStatus | null = null;

    if (STATUS_ORDER.includes(overId as ProjectStatus)) {
      newStatus = overId as ProjectStatus;
    } else {
      const overProject = projects.find((p) => p._id === overId);
      if (overProject) {
        newStatus = overProject.status;
      }
    }

    const project = projects.find((p) => p._id === projectId);
    if (!project || !newStatus || project.status === newStatus) return;

    const indexNew = STATUS_ORDER.indexOf(newStatus);
    const indexCurrent = STATUS_ORDER.indexOf(project.status as ProjectStatus);

    if (indexNew < indexCurrent) {
      setRejectDialog({
        isOpen: true,
        projectId,
        projectTitle: project.title,
        newStatus,
      });
      return;
    }

    statusMutation.mutate({ id: projectId, status: newStatus, notes: '' });
  };

  const handleConfirmReject = () => {
    if (!rejectDialog) return;
    statusMutation.mutate({
      id: rejectDialog.projectId,
      status: rejectDialog.newStatus,
      notes: rejectNotes,
    });
  };

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {STATUS_ORDER.map((status) => (
            <Column
              key={status}
              status={status}
              projects={grouped[status]}
              onProjectClick={onProjectClick}
            />
          ))}
        </div>
      </DndContext>

      <Modal
        isOpen={!!rejectDialog?.isOpen}
        onClose={() => {
          setRejectDialog(null);
          setRejectNotes('');
        }}
        title="Reason for returning project"
      >
        <div className="space-y-4">
          <p className="text-sm text-surface-300">
            You are moving <span className="font-bold text-white">{rejectDialog?.projectTitle}</span> back to <span className="font-bold text-white">{rejectDialog?.newStatus}</span>.
            Please describe the required changes.
          </p>
          <textarea
            className="input-field min-h-[120px]"
            value={rejectNotes}
            onChange={(e) => setRejectNotes(e.target.value)}
            placeholder="E.g. The logo needs to be bigger..."
            autoFocus
          />
          <div className="flex justify-end gap-3 pt-4 border-t border-surface-700/50">
            <button
              onClick={() => {
                setRejectDialog(null);
                setRejectNotes('');
              }}
              className="btn-ghost"
              disabled={statusMutation.isPending}
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmReject}
              disabled={statusMutation.isPending || rejectNotes.trim() === ''}
              className="btn-primary px-6"
            >
              {statusMutation.isPending ? 'Sending...' : 'Send Back'}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default Board;
