import React, { useState, useEffect } from 'react';
import { Plus, Loader2, Trash2, Palette, Code2 } from 'lucide-react';
import type { Client, Settings } from '../../lib/types';
import { useSopEditor } from '../../hooks/useSopEditor';

interface CreateProjectFormProps {
  clients: Client[];
  settings?: Settings;
  onSubmit: (data: {
    title: string;
    clientId: string;
    notes: string;
    driveLink: string;
    designerSop: { task: string; isCompleted: boolean }[];
    developerSop: { task: string; isCompleted: boolean }[];
  }) => void;
  isPending: boolean;
}

export const CreateProjectForm: React.FC<CreateProjectFormProps> = ({ clients, settings, onSubmit, isPending }) => {
  const [newProject, setNewProject] = useState({ title: '', clientId: '', driveLink: '', notes: '' });

  const {
    designerSop,
    setDesignerSop,
    developerSop,
    setDeveloperSop,
    handleAddField,
    handleUpdateField,
    handleRemoveField,
  } = useSopEditor(settings?.designerSopTemplate || [], settings?.developerSopTemplate || []);

  useEffect(() => {
    if (settings) {
      setDesignerSop(settings.designerSopTemplate || []);
      setDeveloperSop(settings.developerSopTemplate || []);
    }
  }, [settings, setDesignerSop, setDeveloperSop]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...newProject,
      designerSop: designerSop.filter(t => t.trim()).map(task => ({ task, isCompleted: false })),
      developerSop: developerSop.filter(t => t.trim()).map(task => ({ task, isCompleted: false })),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="label-text">Project Title</label>
        <input
          className="input-field"
          value={newProject.title}
          onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
          placeholder="Website Redesign"
          required
        />
      </div>
      <div>
        <label className="label-text">Client</label>
        <select
          className="input-field"
          value={newProject.clientId}
          onChange={(e) => setNewProject({ ...newProject, clientId: e.target.value })}
          required
        >
          <option value="">Select a client...</option>
          {clients.map((c) => (
            <option key={c._id} value={c._id}>{c.companyName}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="label-text">Project Notes</label>
        <textarea
          className="input-field min-h-[100px]"
          value={newProject.notes}
          onChange={(e) => setNewProject({ ...newProject, notes: e.target.value })}
          placeholder="Specific instructions or goals for this project..."
        />
      </div>
      <div>
        <label className="label-text">Drive Link (optional)</label>
        <input
          className="input-field"
          value={newProject.driveLink}
          onChange={(e) => setNewProject({ ...newProject, driveLink: e.target.value })}
          placeholder="https://drive.google.com/..."
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-y border-surface-700/50 py-4 my-2">
        <div>
          <div className="flex items-center gap-2 mb-2 text-violet-400">
            <Palette className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Designer SOP</span>
          </div>
          <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
            {designerSop.map((task, idx) => (
              <div key={idx} className="flex gap-1">
                <input
                  className="input-field py-1 px-2 text-xs"
                  value={task}
                  onChange={(e) => handleUpdateField('designer', idx, e.target.value)}
                />
                <button type="button" onClick={() => handleRemoveField('designer', idx)} className="p-1.5 text-surface-500 hover:text-red-400">
                  <Trash2 className="w-3 h-3" />
            </button>
              </div>
            ))}
            <button type="button" onClick={() => handleAddField('designer')} className="w-full py-1.5 border border-dashed border-surface-700 rounded-lg text-[10px] text-surface-500 hover:text-surface-300">
              + Add Task
            </button>
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-2 text-cyan-400">
            <Code2 className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Developer SOP</span>
          </div>
          <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
            {developerSop.map((task, idx) => (
              <div key={idx} className="flex gap-1">
                <input
                  className="input-field py-1 px-2 text-xs"
                  value={task}
                  onChange={(e) => handleUpdateField('developer', idx, e.target.value)}
                />
                <button type="button" onClick={() => handleRemoveField('developer', idx)} className="p-1.5 text-surface-500 hover:text-red-400">
                  <Trash2 className="w-3 h-3" />
            </button>
              </div>
            ))}
            <button type="button" onClick={() => handleAddField('developer')} className="w-full py-1.5 border border-dashed border-surface-700 rounded-lg text-[10px] text-surface-500 hover:text-surface-300">
              + Add Task
            </button>
          </div>
        </div>
      </div>

      <button type="submit" className="w-full btn-primary flex items-center justify-center gap-2 py-3" disabled={isPending}>
        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
        Create Project
      </button>
    </form>
  );
};
