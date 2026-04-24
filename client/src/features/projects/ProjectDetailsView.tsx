import React, { useState } from 'react';
import { Loader2, ExternalLink, Save, Copy, Check, FileText, Trash2, Eye, EyeOff } from 'lucide-react';
import type { Project, User, Settings } from '../../lib/types';
import { copyToClipboard, getWpAdminUrl } from '../../lib/utils';
import type { UpdateProjectPayload } from '../../hooks/useProjectMutations';

interface ProjectDetailsViewProps {
  project: Project;
  designers: User[];
  developers: User[];
  settings?: Settings;
  isPending: boolean;
  onSave: (id: string, data: UpdateProjectPayload) => void;
}

export const ProjectDetailsView: React.FC<ProjectDetailsViewProps> = ({ project, designers, developers, settings, isPending, onSave }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const [editForm, setEditForm] = useState<{
    designerId: string;
    developerId: string;
    figmaLink: string;
    driveLink: string;
    domainUrl: string;
    wpAdminUser: string;
    wpAdminPassword: string;
    notes: string;
    designerSop: { task: string; isCompleted: boolean; _id?: string }[];
    developerSop: { task: string; isCompleted: boolean; _id?: string }[];
  }>({
    designerId: typeof project.designerId === 'object' && project.designerId ? project.designerId._id : '',
    developerId: typeof project.developerId === 'object' && project.developerId ? project.developerId._id : '',
    figmaLink: project.assets?.figmaLink || '',
    driveLink: project.assets?.driveLink || '',
    domainUrl: project.developmentData?.domainUrl || '',
    wpAdminUser: project.developmentData?.wpAdminUser || '',
    wpAdminPassword: project.developmentData?.wpAdminPassword || '',
    notes: project.notes || '',
    designerSop: project.designerSop || [],
    developerSop: project.developerSop || [],
  });

  const handleCopy = async (text: string, field: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  const handleSaveProject = () => {
    onSave(project._id, {
      designerId: editForm.designerId || null,
      developerId: editForm.developerId || null,
      notes: editForm.notes,
      assets: {
        figmaLink: editForm.figmaLink,
        driveLink: editForm.driveLink,
      },
      developmentData: {
        domainUrl: editForm.domainUrl,
        wpAdminUser: editForm.wpAdminUser,
        wpAdminPassword: editForm.wpAdminPassword,
      },
      designerSop: editForm.designerSop,
      developerSop: editForm.developerSop,
    });
  };

  return (
    <div className="space-y-4">
      {/* Notes */}
      <div className="p-3 bg-brand-500/5 border border-brand-500/20 rounded-xl">
        <div className="flex items-center gap-2 mb-2 text-brand-400">
          <FileText className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-wider">Project Notes</span>
        </div>
        <textarea
          className="w-full bg-transparent text-sm text-surface-300 border-none focus:ring-0 resize-none min-h-[80px]"
          value={editForm.notes}
          onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
          placeholder="Add project notes here..."
        />
      </div>

      {/* Assignments */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="label-text">Designer</label>
          <select
            className="input-field"
            value={editForm.designerId}
            onChange={(e) => setEditForm({ ...editForm, designerId: e.target.value })}
          >
            <option value="">Unassigned</option>
            {designers.map((d) => (
              <option key={d._id} value={d._id}>{d.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label-text">Developer</label>
          <select
            className="input-field"
            value={editForm.developerId}
            onChange={(e) => setEditForm({ ...editForm, developerId: e.target.value })}
          >
            <option value="">Unassigned</option>
            {developers.map((d) => (
              <option key={d._id} value={d._id}>{d.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Assets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="label-text">Drive Link</label>
          <div className="flex gap-2">
            <input
              className="input-field"
              value={editForm.driveLink}
              onChange={(e) => setEditForm({ ...editForm, driveLink: e.target.value })}
              placeholder="Drive Link"
            />
            {editForm.driveLink && (
              <a href={editForm.driveLink} target="_blank" rel="noreferrer" className="btn-ghost flex items-center p-2">
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
        <div>
          <label className="label-text">Figma Link</label>
          <div className="flex gap-2">
            <input
              className="input-field"
              value={editForm.figmaLink}
              onChange={(e) => setEditForm({ ...editForm, figmaLink: e.target.value })}
              placeholder="Figma Link"
            />
            {editForm.figmaLink && (
              <a href={editForm.figmaLink} target="_blank" rel="noreferrer" className="btn-ghost flex items-center p-2">
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* WordPress Credentials */}
      <div className="p-3 bg-surface-900/50 rounded-xl border border-surface-700/30 space-y-3">
        <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider">WordPress Access</p>
        <div>
          <label className="label-text">Domain URL (Redirects to /wp-admin)</label>
          <div className="flex gap-2">
            <input
              className="input-field"
              value={editForm.domainUrl}
              onChange={(e) => setEditForm({ ...editForm, domainUrl: e.target.value })}
              placeholder="https://example.com"
            />
            {editForm.domainUrl && (
              <a href={getWpAdminUrl(editForm.domainUrl)} target="_blank" rel="noreferrer" className="btn-ghost flex items-center p-2">
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="label-text">Username</label>
            <div className="flex gap-2">
              <input
                className="input-field"
                value={editForm.wpAdminUser}
                onChange={(e) => setEditForm({ ...editForm, wpAdminUser: e.target.value })}
              />
              <button type="button" onClick={() => handleCopy(editForm.wpAdminUser, 'user')} className="btn-ghost p-2">
                {copiedField === 'user' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="label-text">Password</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input-field pr-10"
                  value={editForm.wpAdminPassword}
                  onChange={(e) => setEditForm({ ...editForm, wpAdminPassword: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-surface-500 hover:text-surface-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <button type="button" onClick={() => handleCopy(editForm.wpAdminPassword, 'pass')} className="btn-ghost p-2">
                {copiedField === 'pass' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SOP Checklists */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Designer SOP */}
        <div className="p-3 bg-surface-900/50 rounded-xl border border-surface-700/30">
          <div className="flex items-center justify-between mb-3 px-1">
            <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest">Designer SOP</span>
            <button 
              type="button" 
              onClick={() => {
                const template = settings?.designerSopTemplate.map(task => ({ task, isCompleted: false })) || [];
                setEditForm({ ...editForm, designerSop: template });
              }}
              className="text-[9px] text-surface-500 hover:text-brand-400 font-medium"
            >
              Reload Template
            </button>
          </div>
          <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
            {editForm.designerSop.map((task, idx) => (
              <div key={idx} className="flex gap-2 group">
                <button
                  type="button"
                  onClick={() => {
                    const next = [...editForm.designerSop];
                    next[idx] = { ...next[idx], isCompleted: !next[idx].isCompleted };
                    setEditForm({ ...editForm, designerSop: next });
                  }}
                  className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center text-[10px] mt-1 ${
                    task.isCompleted ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'border-surface-700'
                  }`}
                >
                  {task.isCompleted && '✓'}
                </button>
                <input
                  className={`flex-1 bg-transparent border-none p-0 text-xs focus:ring-0 ${task.isCompleted ? 'text-surface-600 line-through' : 'text-surface-300'}`}
                  value={task.task}
                  onChange={(e) => {
                    const next = [...editForm.designerSop];
                    next[idx] = { ...next[idx], task: e.target.value };
                    setEditForm({ ...editForm, designerSop: next });
                  }}
                />
                <button 
                  type="button" 
                  onClick={() => setEditForm({ ...editForm, designerSop: editForm.designerSop.filter((_, i) => i !== idx) })}
                  className="p-1 opacity-0 group-hover:opacity-100 text-surface-600 hover:text-red-400"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
            <button 
              type="button" 
              onClick={() => setEditForm({ ...editForm, designerSop: [...editForm.designerSop, { task: '', isCompleted: false }] })}
              className="w-full py-1.5 border border-dashed border-surface-800 rounded-lg text-[10px] text-surface-600 hover:text-surface-400 hover:border-surface-700 font-medium"
            >
              + Add Task
            </button>
          </div>
        </div>

        {/* Developer SOP */}
        <div className="p-3 bg-surface-900/50 rounded-xl border border-surface-700/30">
          <div className="flex items-center justify-between mb-3 px-1">
            <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">Developer SOP</span>
            <button 
              type="button" 
              onClick={() => {
                const template = settings?.developerSopTemplate.map(task => ({ task, isCompleted: false })) || [];
                setEditForm({ ...editForm, developerSop: template });
              }}
              className="text-[9px] text-surface-500 hover:text-brand-400 font-medium"
            >
              Reload Template
            </button>
          </div>
          <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
            {editForm.developerSop.map((task, idx) => (
              <div key={idx} className="flex gap-2 group">
                <button
                  type="button"
                  onClick={() => {
                    const next = [...editForm.developerSop];
                    next[idx] = { ...next[idx], isCompleted: !next[idx].isCompleted };
                    setEditForm({ ...editForm, developerSop: next });
                  }}
                  className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center text-[10px] mt-1 ${
                    task.isCompleted ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'border-surface-700'
                  }`}
                >
                  {task.isCompleted && '✓'}
                </button>
                <input
                  className={`flex-1 bg-transparent border-none p-0 text-xs focus:ring-0 ${task.isCompleted ? 'text-surface-600 line-through' : 'text-surface-300'}`}
                  value={task.task}
                  onChange={(e) => {
                    const next = [...editForm.developerSop];
                    next[idx] = { ...next[idx], task: e.target.value };
                    setEditForm({ ...editForm, developerSop: next });
                  }}
                />
                <button 
                  type="button" 
                  onClick={() => setEditForm({ ...editForm, developerSop: editForm.developerSop.filter((_, i) => i !== idx) })}
                  className="p-1 opacity-0 group-hover:opacity-100 text-surface-600 hover:text-red-400"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
            <button 
              type="button" 
              onClick={() => setEditForm({ ...editForm, developerSop: [...editForm.developerSop, { task: '', isCompleted: false }] })}
              className="w-full py-1.5 border border-dashed border-surface-800 rounded-lg text-[10px] text-surface-600 hover:text-surface-400 hover:border-surface-700 font-medium"
            >
              + Add Task
            </button>
          </div>
        </div>
      </div>

      <button onClick={handleSaveProject} className="w-full btn-primary flex items-center justify-center gap-2" disabled={isPending}>
        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        Save Changes
      </button>
    </div>
  );
};
