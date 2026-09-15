import React, { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, CheckCircle2, AlertCircle, Sparkles, X } from 'lucide-react';
import { packagesApi } from '../../api/client';

const categories = ['Wedding', 'Pre-Wedding', 'Birthday', 'Engagement', 'Portrait', 'Cinematic', 'General'];

const AdminPackages = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [statusMsg, setStatusMsg] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: '',
    category: 'Wedding',
    price: '',
    description: '',
    features: '',
    deliveryDays: 15,
    isPopular: false,
    isActive: true,
  });

  const fetchPackages = async () => {
    setLoading(true);
    try {
      const res = await packagesApi.getAllAdmin();
      if (res.data && res.data.data) {
        setPackages(res.data.data);
      }
    } catch (err) {
      console.error('[Admin packages fetch error]:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const handleOpenAdd = () => {
    setEditingPackage(null);
    setForm({
      name: '',
      category: 'Wedding',
      price: '',
      description: '',
      features: '',
      deliveryDays: 15,
      isPopular: false,
      isActive: true,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (pkg) => {
    setEditingPackage(pkg);
    setForm({
      name: pkg.name || '',
      category: pkg.category || 'Wedding',
      price: pkg.price || '',
      description: pkg.description || '',
      features: (pkg.features || []).join('\n'),
      deliveryDays: pkg.deliveryDays || 15,
      isPopular: pkg.isPopular || false,
      isActive: pkg.isActive !== undefined ? pkg.isActive : true,
    });
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this package?')) return;
    try {
      await packagesApi.delete(id);
      setStatusMsg({ type: 'success', text: 'Package deleted successfully.' });
      fetchPackages();
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.response?.data?.message || 'Failed to delete package.' });
    }
  };

  const handleToggleStatus = async (pkg) => {
    try {
      await packagesApi.update(pkg._id, { isActive: !pkg.isActive });
      fetchPackages();
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Failed to update package status.' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setStatusMsg(null);

    const data = {
      name: form.name,
      category: form.category,
      price: Number(form.price),
      description: form.description,
      features: form.features,
      deliveryDays: Number(form.deliveryDays),
      isPopular: form.isPopular,
      isActive: form.isActive,
    };

    try {
      if (editingPackage) {
        await packagesApi.update(editingPackage._id, data);
        setStatusMsg({ type: 'success', text: 'Package updated successfully!' });
      } else {
        await packagesApi.create(data);
        setStatusMsg({ type: 'success', text: 'Package created successfully!' });
      }
      setModalOpen(false);
      fetchPackages();
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.response?.data?.message || 'Failed to save package.' });
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
            Packages & Pricing Management
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 font-light">
            Update pricing tiers, deliverable bullet points, and active flags in real-time.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-brand-accent hover:bg-rose-700 text-white text-xs font-bold uppercase tracking-wider shadow-glow-red transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Package</span>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-64 rounded-2xl bg-slate-900/60 animate-pulse border border-slate-800" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <div
              key={pkg._id}
              className={`rounded-2xl p-6 bg-brand-card border flex flex-col justify-between transition-all ${
                pkg.isActive ? 'border-slate-800' : 'border-slate-800/40 opacity-60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase font-bold text-amber-400">
                    {pkg.category}
                  </span>
                  <div className="flex items-center space-x-1.5">
                    {pkg.isPopular && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-brand-accent text-white flex items-center space-x-1">
                        <Sparkles className="w-2.5 h-2.5" />
                        <span>Popular</span>
                      </span>
                    )}
                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                        pkg.isActive
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                          : 'bg-rose-950 text-rose-300 border border-rose-700'
                      }`}
                    >
                      {pkg.isActive ? 'Active' : 'Hidden'}
                    </span>
                  </div>
                </div>

                <h4 className="text-xl font-cinematic font-bold text-white">{pkg.name}</h4>
                <div className="text-2xl font-cinematic font-extrabold text-emerald-400 mt-2 mb-3">
                  {formatPrice(pkg.price)}
                </div>

                <p className="text-xs text-slate-400 mb-4 line-clamp-2">{pkg.description}</p>

                <div className="space-y-1 text-xs text-slate-300 border-t border-slate-800/60 pt-3">
                  {pkg.features?.slice(0, 4).map((f, i) => (
                    <div key={i} className="truncate">
                      • {f}
                    </div>
                  ))}
                  {pkg.features?.length > 4 && (
                    <div className="text-[10px] text-slate-500 italic">
                      + {pkg.features.length - 4} more features
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => handleToggleStatus(pkg)}
                  className="text-[11px] font-semibold text-slate-400 hover:text-white"
                >
                  {pkg.isActive ? 'Disable' : 'Enable'}
                </button>

                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => handleOpenEdit(pkg)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(pkg._id)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/60 text-slate-400 hover:text-rose-300"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="max-w-md w-full my-auto rounded-3xl bg-brand-navy border border-slate-700 p-5 sm:p-8 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-cinematic font-bold text-white">
                {editingPackage ? 'Edit Package' : 'Create New Package'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Package Name *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Wedding Signature Cinema"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Category *</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                  />
                </div>
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

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Features (one per line) *</label>
                <textarea
                  rows="4"
                  required
                  value={form.features}
                  onChange={(e) => setForm({ ...form, features: e.target.value })}
                  placeholder="2 Candid Photographers&#10;4K Cinematic Film&#10;Drone Aerial Coverage&#10;Leather Photobook (40 Pgs)"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs resize-none font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Estimated Days Delivery</label>
                  <input
                    type="number"
                    value={form.deliveryDays}
                    onChange={(e) => setForm({ ...form, deliveryDays: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                  />
                </div>

                <div className="flex flex-col justify-end space-y-1.5 pb-2">
                  <label className="flex items-center space-x-2 text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.isPopular}
                      onChange={(e) => setForm({ ...form, isPopular: e.target.checked })}
                      className="rounded border-slate-700 text-brand-accent"
                    />
                    <span>Highlight as Popular</span>
                  </label>
                  <label className="flex items-center space-x-2 text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.isActive}
                      onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                      className="rounded border-slate-700 text-brand-accent"
                    />
                    <span>Active on site</span>
                  </label>
                </div>
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
                  {submitting ? 'Saving...' : 'Save Package'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPackages;
