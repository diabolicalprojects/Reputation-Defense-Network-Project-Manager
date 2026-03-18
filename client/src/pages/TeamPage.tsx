import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '../components/Layout/Layout';
import Modal from '../components/Modal';
import api from '../lib/api';
import type { User } from '../lib/types';
import { UserPlus, Loader2, Trash2, Shield, Palette, Code2 } from 'lucide-react';

const ROLE_CONFIG: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  PM: { icon: <Shield className="w-4 h-4" />, color: 'from-brand-500 to-brand-600', label: 'Project Manager' },
  DESIGNER: { icon: <Palette className="w-4 h-4" />, color: 'from-violet-500 to-violet-600', label: 'Web Designer' },
  DEVELOPER: { icon: <Code2 className="w-4 h-4" />, color: 'from-cyan-500 to-cyan-600', label: 'Web Developer' },
  BOTH: { icon: <Code2 className="w-4 h-4" />, color: 'from-emerald-500 to-emerald-600', label: 'Designer & Developer' },
};

const TeamPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'DESIGNER' });

  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: () => api.get('/users').then((r) => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/auth/register', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setShowNew(false);
      setForm({ name: '', email: '', password: '', role: 'DESIGNER' });
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Failed to create user');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(form);
  };

  if (isLoading) {
    return (
      <Layout title="Team">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      title="Team"
      subtitle={`${users.length} team members`}
      actions={
        <button onClick={() => setShowNew(true)} className="btn-primary flex items-center gap-2">
          <UserPlus className="w-4 h-4" /> Add Member
        </button>
      }
    >
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {users.map((user) => {
          const config = ROLE_CONFIG[user.role] || ROLE_CONFIG.DESIGNER;
          return (
            <div key={user._id} className="card p-5 group">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${config.color} flex items-center justify-center text-white shadow-lg`}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <button
                  onClick={() => {
                    if (confirm(`Delete ${user.name}?`)) deleteMutation.mutate(user._id);
                  }}
                  className="p-1.5 rounded-lg hover:bg-red-500/10 text-surface-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <h3 className="text-base font-semibold text-white">{user.name}</h3>
              <p className="text-sm text-surface-500 mb-2">{user.email}</p>
              <span className={`inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-lg bg-gradient-to-r ${config.color} bg-opacity-10 text-white/80`}>
                {config.icon} {config.label}
              </span>
            </div>
          );
        })}
      </div>

      <Modal isOpen={showNew} onClose={() => setShowNew(false)} title="Add Team Member">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="label-text">Full Name</label>
            <input className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div>
            <label className="label-text">Email</label>
            <input className="input-field" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div>
            <label className="label-text">Password</label>
            <input className="input-field" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} />
          </div>
          <div>
            <label className="label-text">Role</label>
            <select className="input-field" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="DESIGNER">Web Designer</option>
              <option value="DEVELOPER">Web Developer</option>
              <option value="BOTH">Designer & Developer</option>
              <option value="PM">Project Manager</option>
            </select>
          </div>
          <button type="submit" disabled={createMutation.isPending} className="w-full btn-primary flex items-center justify-center gap-2">
            {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
            Create User
          </button>
        </form>
      </Modal>
    </Layout>
  );
};

export default TeamPage;
