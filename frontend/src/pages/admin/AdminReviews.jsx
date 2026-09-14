import React, { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, Star, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { reviewsApi } from '../../api/client';

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [statusMsg, setStatusMsg] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    customerName: '',
    eventType: 'Wedding Photography',
    rating: 5,
    comment: '',
    customerPhoto: '',
    eventDate: '',
    isActive: true,
  });

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await reviewsApi.getAllAdmin();
      if (res.data && res.data.data) {
        setReviews(res.data.data);
      }
    } catch (err) {
      console.error('[Admin reviews fetch error]:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleOpenAdd = () => {
    setEditingReview(null);
    setForm({
      customerName: '',
      eventType: 'Wedding Photography',
      rating: 5,
      comment: '',
      customerPhoto: '',
      eventDate: 'January 2026',
      isActive: true,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (rev) => {
    setEditingReview(rev);
    setForm({
      customerName: rev.customerName || '',
      eventType: rev.eventType || 'Wedding Photography',
      rating: rev.rating || 5,
      comment: rev.comment || '',
      customerPhoto: rev.customerPhoto || '',
      eventDate: rev.eventDate || '',
      isActive: rev.isActive !== undefined ? rev.isActive : true,
    });
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      await reviewsApi.delete(id);
      setStatusMsg({ type: 'success', text: 'Review deleted.' });
      fetchReviews();
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Failed to delete review.' });
    }
  };

  const handleToggleStatus = async (rev) => {
    try {
      await reviewsApi.update(rev._id, { isActive: !rev.isActive });
      fetchReviews();
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Failed to update review status.' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setStatusMsg(null);

    try {
      if (editingReview) {
        await reviewsApi.update(editingReview._id, form);
        setStatusMsg({ type: 'success', text: 'Review updated successfully.' });
      } else {
        await reviewsApi.create(form);
        setStatusMsg({ type: 'success', text: 'Review added successfully.' });
      }
      setModalOpen(false);
      fetchReviews();
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.response?.data?.message || 'Failed to save review.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-cinematic font-bold text-white tracking-wide">
            Reviews & Testimonials
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 font-light">
            Manage feedback and star ratings that appear in the public carousel.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-brand-accent hover:bg-rose-700 text-white text-xs font-bold uppercase tracking-wider shadow-glow-red transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Review</span>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((n) => (
            <div key={n} className="h-44 rounded-2xl bg-slate-900/60 animate-pulse border border-slate-800" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reviews.map((rev) => (
            <div
              key={rev._id}
              className={`p-6 rounded-2xl bg-brand-card border flex flex-col justify-between ${
                rev.isActive ? 'border-slate-800' : 'border-slate-800/40 opacity-60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-1">
                    {[...Array(rev.rating || 5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                      rev.isActive
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                        : 'bg-rose-950 text-rose-300 border border-rose-700'
                    }`}
                  >
                    {rev.isActive ? 'Active' : 'Hidden'}
                  </span>
                </div>

                <p className="text-xs text-slate-300 italic mb-4 font-light leading-relaxed">
                  “{rev.comment}”
                </p>
                <div className="font-semibold text-white text-sm font-cinematic">{rev.customerName}</div>
                <div className="text-[11px] text-brand-accent">{rev.eventType} {rev.eventDate ? `(${rev.eventDate})` : ''}</div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => handleToggleStatus(rev)}
                  className="text-[11px] font-semibold text-slate-400 hover:text-white"
                >
                  {rev.isActive ? 'Disable' : 'Enable'}
                </button>
                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => handleOpenEdit(rev)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(rev._id)}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="max-w-md w-full rounded-3xl bg-brand-navy border border-slate-700 p-6 sm:p-8 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-cinematic font-bold text-white">
                {editingReview ? 'Edit Review' : 'Add Testimonial'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Customer Name *</label>
                <input
                  type="text"
                  required
                  value={form.customerName}
                  onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                  placeholder="e.g. Rohan & Priya"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Event Type</label>
                  <input
                    type="text"
                    value={form.eventType}
                    onChange={(e) => setForm({ ...form, eventType: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Star Rating (1-5)</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={form.rating}
                    onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Review Comment *</label>
                <textarea
                  rows="3"
                  required
                  value={form.comment}
                  onChange={(e) => setForm({ ...form, comment: e.target.value })}
                  placeholder="Their words about the photos and cinema experience..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs resize-none"
                />
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
                  {submitting ? 'Saving...' : 'Save Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReviews;
