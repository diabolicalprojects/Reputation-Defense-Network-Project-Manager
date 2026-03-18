import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '../components/Layout/Layout';
import api from '../lib/api';
import { Plus, Trash2, Save, Loader2, Shield, User as UserIcon, Mail } from 'lucide-react';
import type { Settings } from '../lib/types';
import { useSopEditor } from '../hooks/useSopEditor';

const SettingsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const {
    designerSop,
    setDesignerSop,
    developerSop,
    setDeveloperSop,
    handleAddField,
    handleUpdateField,
    handleRemoveField,
  } = useSopEditor();
  
  // Team management state
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'DESIGNER' });

  const { data: settings, isLoading } = useQuery<Settings>({
    queryKey: ['settings'],
    queryFn: () => api.get('/settings').then((r) => r.data),
  });

  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => api.get('/users').then((r) => r.data),
  });

  const registerMutation = useMutation({
    mutationFn: () => api.post('/auth/register', newUser),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsAddingUser(false);
      setNewUser({ name: '', email: '', password: '', role: 'DESIGNER' });
      alert('Team member registered successfully!');
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Error registering member');
    }
  });

  const deleteUserMutation = useMutation({
    mutationFn: (userId: string) => api.delete(`/users/${userId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      alert('Member deleted successfully');
    }
  });

  useEffect(() => {
    if (settings) {
      setDesignerSop(settings.designerSopTemplate || []);
      setDeveloperSop(settings.developerSopTemplate || []);
    }
  }, [settings, setDesignerSop, setDeveloperSop]);

  const updateMutation = useMutation({
    mutationFn: (data: Partial<Settings>) => api.put('/settings', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      alert('Settings saved successfully!');
    },
  });

  const handleSave = () => {
    updateMutation.mutate({
      designerSopTemplate: designerSop.filter(s => s.trim() !== ''),
      developerSopTemplate: developerSop.filter(s => s.trim() !== ''),
    });
  };

  if (isLoading) {
    return (
      <Layout title="Global Settings">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Global Settings" subtitle="Define default SOP checklists for all new projects">
      <div className="max-w-4xl space-y-8 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Designer SOP Template */}
          <div className="card p-6 space-y-4">
            <div className="flex items-center gap-2 text-violet-400 mb-2">
              <Plus className="w-5 h-5" />
              <h2 className="text-lg font-bold">Designer SOP Template</h2>
            </div>
            <p className="text-xs text-surface-500 mb-4 uppercase tracking-widest font-semibold">
              These tasks will be added to every new project
            </p>
            <div className="space-y-3">
              {designerSop.map((task, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    className="input-field py-2"
                    value={task}
                    onChange={(e) => handleUpdateField('designer', index, e.target.value)}
                    placeholder="e.g. Create Figma File"
                  />
                  <button onClick={() => handleRemoveField('designer', index)} className="p-2 text-surface-500 hover:text-red-400 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button 
                onClick={() => handleAddField('designer')}
                className="w-full py-2 border-2 border-dashed border-surface-700 rounded-xl text-surface-500 hover:border-violet-500 hover:text-violet-400 transition-all flex items-center justify-center gap-2 text-sm"
              >
                <Plus className="w-4 h-4" /> Add Task
              </button>
            </div>
          </div>

          {/* Developer SOP Template */}
          <div className="card p-6 space-y-4">
            <div className="flex items-center gap-2 text-cyan-400 mb-2">
              <Plus className="w-5 h-5" />
              <h2 className="text-lg font-bold">Developer SOP Template</h2>
            </div>
            <p className="text-xs text-surface-500 mb-4 uppercase tracking-widest font-semibold">
              These tasks will be added to every new project
            </p>
            <div className="space-y-3">
              {developerSop.map((task, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    className="input-field py-2"
                    value={task}
                    onChange={(e) => handleUpdateField('developer', index, e.target.value)}
                    placeholder="e.g. Set up WP instance"
                  />
                  <button onClick={() => handleRemoveField('developer', index)} className="p-2 text-surface-500 hover:text-red-400 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button 
                onClick={() => handleAddField('developer')}
                className="w-full py-2 border-2 border-dashed border-surface-700 rounded-xl text-surface-500 hover:border-cyan-500 hover:text-cyan-400 transition-all flex items-center justify-center gap-2 text-sm"
              >
                <Plus className="w-4 h-4" /> Add Task
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-end p-4 bg-surface-900/50 rounded-2xl border border-surface-700/30">
          <button 
            onClick={handleSave} 
            disabled={updateMutation.isPending}
            className="btn-primary px-8 flex items-center gap-2 py-3"
          >
            {updateMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Save Global Templates
          </button>
        </div>

        {/* Team Management Section */}
        <div className="card p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-brand-400">
              <Shield className="w-5 h-5" />
              <h2 className="text-xl font-bold">Team Management</h2>
            </div>
            <button 
              onClick={() => setIsAddingUser(!isAddingUser)}
              className="btn-secondary px-4 py-2 text-sm flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> {isAddingUser ? 'Cancel' : 'Add New Member'}
            </button>
          </div>

          {isAddingUser && (
            <div className="p-4 bg-surface-900 border border-surface-700/50 rounded-2xl animate-in fade-in slide-in-from-top-4 duration-300">
              <h3 className="text-sm font-bold text-surface-200 mb-4 flex items-center gap-2">
                <UserIcon className="w-4 h-4 text-brand-400" /> Register New Team Member
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-surface-500 uppercase font-bold px-1">Full Name</label>
                  <input 
                    className="input-field py-2" 
                    placeholder="John Doe"
                    value={newUser.name}
                    onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-surface-500 uppercase font-bold px-1">Email Address</label>
                  <input 
                    className="input-field py-2" 
                    placeholder="john@example.com"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-surface-500 uppercase font-bold px-1">Access Password</label>
                  <input 
                    className="input-field py-2" 
                    type="password"
                    placeholder="••••••••"
                    value={newUser.password}
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-surface-500 uppercase font-bold px-1">System Role</label>
                  <select 
                    className="input-field py-2"
                    value={newUser.role}
                    onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                  >
                    <option value="DESIGNER">Designer</option>
                    <option value="DEVELOPER">Developer</option>
                    <option value="BOTH">Designer & Developer</option>
                  </select>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <button 
                  onClick={() => registerMutation.mutate()}
                  disabled={registerMutation.isPending}
                  className="btn-primary px-6 py-2 text-sm flex items-center gap-2"
                >
                  {registerMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Register Member
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {usersLoading ? (
              <div className="col-span-full py-10 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-surface-500" /></div>
            ) : users.length === 0 ? (
              <div className="col-span-full py-10 text-center text-surface-500 bg-surface-900/50 rounded-2xl border border-dashed border-surface-700">
                You haven't added any team members yet.
              </div>
            ) : (
              users.filter((u: any) => u.isActive).map((u: any) => (
                <div key={u._id} className="p-4 bg-surface-900/50 border border-surface-700/30 rounded-xl hover:border-brand-500/30 transition-all group">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${u.role === 'DESIGNER' ? 'bg-violet-500/10 text-violet-400' : 'bg-cyan-500/10 text-cyan-400'}`}>
                        <UserIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-surface-200">{u.name}</p>
                        <p className="text-[10px] text-surface-500 flex items-center gap-1 mt-0.5">
                          <Mail className="w-3 h-3" /> {u.email}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest ${
                      u.role === 'DESIGNER' ? 'bg-violet-500/10 text-violet-400' : 'bg-cyan-500/10 text-cyan-400'
                    }`}>
                      {u.role}
                    </span>
                    <button onClick={() => {
                      if(window.confirm('Are you sure you want to deactivate this member?')) {
                        deleteUserMutation.mutate(u._id)
                      }
                    }} className="p-1.5 text-surface-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SettingsPage;
