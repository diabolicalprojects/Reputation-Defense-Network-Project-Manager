import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import Modal from '../components/Modal';
import api from '../lib/api';
import type { Client } from '../lib/types';
import { Plus, Search, Building2, Mail, Phone, Loader2, Trash2 } from 'lucide-react';

const ClientList: React.FC = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [showNew, setShowNew] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ companyName: '', contactName: '', email: '', phone: '', notes: '' });

  const { data: clients = [], isLoading } = useQuery<Client[]>({
    queryKey: ['clients'],
    queryFn: () => api.get('/clients').then((r) => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/clients', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      setShowNew(false);
      setForm({ companyName: '', contactName: '', email: '', phone: '', notes: '' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/clients/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });

  const filtered = clients.filter((c) =>
    c.companyName.toLowerCase().includes(search.toLowerCase()) ||
    c.contactName.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(form);
  };

  if (isLoading) {
    return (
      <Layout title="Clients">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      title="Clients"
      subtitle={`${clients.length} total clients`}
      actions={
        <button onClick={() => setShowNew(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Client
        </button>
      }
    >
      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
          <input
            className="input-field pl-10"
            placeholder="Search clients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((client) => (
          <div
            key={client._id}
            onClick={() => navigate(`/clients/${client._id}`)}
            className="card-hover group p-5"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-11 h-11 rounded-xl bg-brand-500/10 flex items-center justify-center group-hover:bg-brand-500/20 transition-colors">
                <Building2 className="w-5 h-5 text-brand-400" />
              </div>
              <div className="flex gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm('Delete this client and all their projects?')) {
                      deleteMutation.mutate(client._id);
                    }
                  }}
                  className="p-1.5 rounded-lg hover:bg-red-500/10 text-surface-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <h3 className="text-base font-semibold text-white mb-0.5">{client.companyName}</h3>
            <p className="text-sm text-surface-400 mb-3">{client.contactName}</p>

            <div className="space-y-1.5 text-xs text-surface-500">
              {client.email && (
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3 h-3" /> {client.email}
                </div>
              )}
              {client.phone && (
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3 h-3" /> {client.phone}
                </div>
              )}
            </div>

            <div className="mt-3 pt-3 border-t border-surface-700/30">
              <span className="text-xs text-surface-600">
                {client.projects?.length || 0} project{(client.projects?.length || 0) !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* New Client Modal */}
      <Modal isOpen={showNew} onClose={() => setShowNew(false)} title="New Client">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="label-text">Company Name</label>
            <input className="input-field" value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} required />
          </div>
          <div>
            <label className="label-text">Contact Name</label>
            <input className="input-field" value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })} required />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="label-text">Email</label>
              <input className="input-field" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <label className="label-text">Phone</label>
              <input className="input-field" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="label-text">Notes</label>
            <textarea className="input-field min-h-[80px] resize-none" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
          <button type="submit" disabled={createMutation.isPending} className="w-full btn-primary flex items-center justify-center gap-2">
            {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Create Client
          </button>
        </form>
      </Modal>
    </Layout>
  );
};

export default ClientList;
