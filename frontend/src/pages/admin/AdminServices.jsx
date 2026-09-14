import React, { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, Check, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { servicesApi, getMediaUrl } from '../../api/client';

const AdminServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [statusMsg, setStatusMsg] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: '',
    description: '',
    startingPrice: '',
    category: 'Photography',
    features: '',
    customImage: '',
    isActive: true,
  });

  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await servicesApi.getAllAdmin();
      if (res.data && res.data.data) {
        setServices(res.data.data);
      }
    } catch (err) {
      console.error('[Admin services error]:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleOpenAdd = () => {
    setEditingService(null);
    setForm({
      title: '',
      description: '',
      startingPrice: '',
      category: 'Photography',
      features: '',
      customImage: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200&auto=format&fit=crop',
      isActive: true,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (srv) => {
    setEditingService(srv);
    setForm({
      title: srv.title || '',
      description: srv.description || '',
      startingPrice: srv.startingPrice || '',
      category: srv.category || 'Photography',
      features: (srv.features || []).join(', '),
      customImage: srv.image || '',
      isActive: srv.isActive !== undefined ? srv.isActive : true,
    });
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;
    try {
      await servicesApi.delete(id);
      setStatusMsg({ type: 'success', text: 'Service deleted successfully.' });
      fetchServices();
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.response?.data?.message || 'Failed to delete service.' });
    }
  };

  const handleToggleStatus = async (srv) => {
    try {
      await servicesApi.update(srv._id, { isActive: !srv.isActive });
      fetchServices();
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Failed to update service status.' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setStatusMsg(null);

    const data = {
      title: form.title,
      description: form.description,
      startingPrice: Number(form.startingPrice),
      category: form.category,
      features: form.features,
      customImage: form.customImage,
      isActive: form.isActive,
    };

    try {
      if (editingService) {
        await servicesApi.update(editingService._id, data);
        setStatusMsg({ type: 'success', text: 'Service updated successfully!' });
      } else {
        await servicesApi.create(data);
        setStatusMsg({ type: 'success', text: 'Service created successfully!' });
      }
      setModalOpen(false);
      fetchServices();
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.response?.data?.message || 'Failed to save service.' });
    } finally {
      setSubmitting(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price || 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-cinematic font-bold text-white tracking-wide">
            Services Management
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 font-light">
            Manage your service offerings, starting prices, and marketing descriptions.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-brand-accent hover:bg-rose-700 text-white text-xs font-bold uppercase tracking-wider shadow-glow-red transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Service</span>
        </button>
      </div>

      {statusMsg && (
        <div
          className={`p-3.5 rounded-xl text-xs flex items-center space-x-2 ${
            statusMsg.type === 'success'
              ? 'bg-emerald-950/70 border border-emerald-500 text-emerald-200'
              : 'bg-rose-950/70 border border-rose-500 text-rose-200'
          }`}
        >
          {statusMsg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-64 rounded-2xl bg-slate-900/60 animate-pulse border border-slate-800" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((srv) => (
            <div
              key={srv._id}
              className={`rounded-2xl bg-brand-card border overflow-hidden transition-all flex flex-col justify-between ${
                srv.isActive ? 'border-slate-800' : 'border-slate-800/40 opacity-60'
              }`}
            >
              <div className="relative h-44 overflow-hidden">
                <img src={getMediaUrl(srv.image)} alt={srv.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-card to-transparent" />
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-black/70 text-amber-400 border border-amber-400/30">
                    {srv.category}
                  </span>
                </div>
                <div className="absolute top-3 right-3">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                      srv.isActive
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                        : 'bg-rose-950 text-rose-300 border border-rose-700'
                    }`}
                  >
                    {srv.isActive ? 'Active' : 'Disabled'}
                  </span>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="text-base font-cinematic font-bold text-white">{srv.title}</h4>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2 font-light">{srv.description}</p>
                  <div className="mt-3 text-lg font-bold text-emerald-400 font-cinematic">
                    From {formatPrice(srv.startingPrice)}
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() => handleToggleStatus(srv)}
                    className="text-[11px] font-semibold text-slate-400 hover:text-white"
                  >
                    {srv.isActive ? 'Disable' : 'Enable'}
                  </button>

                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => handleOpenEdit(srv)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(srv._id)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/60 text-slate-400 hover:text-rose-300"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="max-w-md w-full rounded-3xl bg-brand-navy border border-slate-700 p-6 sm:p-8 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-cinematic font-bold text-white">
                {editingService ? 'Edit Service' : 'Add New Service'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Description *</label>
                <textarea
                  rows="2"
                  required
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Starting Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={form.startingPrice}
                    onChange={(e) => setForm({ ...form, startingPrice: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Category</label>
                  <input
                    type="text"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Image URL</label>
                <input
                  type="url"
                  value={form.customImage}
                  onChange={(e) => setForm({ ...form, customImage: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Key Features (comma separated)</label>
                <input
                  type="text"
                  value={form.features}
                  onChange={(e) => setForm({ ...form, features: e.target.value })}
                  placeholder="2 Candid Photographers, 4K Drone, Leather Album"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="srvActive"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="rounded border-slate-700 text-brand-accent w-4 h-4 cursor-pointer"
                />
                <label htmlFor="srvActive" className="text-slate-300 cursor-pointer">
                  Service is visible on website
                </label>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-brand-accent hover:bg-rose-700 text-white font-bold"
                >
                  {submitting ? 'Saving...' : 'Save Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminServices;
