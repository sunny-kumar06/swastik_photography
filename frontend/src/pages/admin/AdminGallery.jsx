import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit3, Image as ImageIcon, Sparkles, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { galleryApi, getMediaUrl } from '../../api/client';

const categories = ['Wedding', 'Pre-Wedding', 'Birthday', 'Engagement', 'Portrait', 'Cinematic', 'Other'];

const AdminGallery = () => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState(null);
  const [statusMsg, setStatusMsg] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [form, setForm] = useState({
    title: '',
    category: 'Wedding',
    description: '',
    isFeatured: false,
    customImageUrl: '',
  });
  const [selectedFile, setSelectedFile] = useState(null);

  const fetchGallery = async () => {
    setLoading(true);
    try {
      const res = await galleryApi.getAll();
      if (res.data && res.data.data) {
        setPhotos(res.data.data);
      }
    } catch (err) {
      console.error('[Gallery fetch error]:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  const handleOpenUpload = () => {
    setEditingPhoto(null);
    setForm({
      title: '',
      category: 'Wedding',
      description: '',
      isFeatured: false,
      customImageUrl: '',
    });
    setSelectedFile(null);
    setUploadModalOpen(true);
  };

  const handleOpenEdit = (photo) => {
    setEditingPhoto(photo);
    setForm({
      title: photo.title || '',
      category: photo.category || 'Wedding',
      description: photo.description || '',
      isFeatured: photo.isFeatured || false,
      customImageUrl: photo.imageUrl || '',
    });
    setSelectedFile(null);
    setUploadModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this photo from the gallery and cloud storage?')) return;
    try {
      await galleryApi.delete(id);
      setStatusMsg({ type: 'success', text: 'Photo deleted successfully.' });
      fetchGallery();
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.response?.data?.message || 'Failed to delete photo.' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setStatusMsg(null);

    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('category', form.category);
    formData.append('description', form.description);
    formData.append('isFeatured', form.isFeatured);
    if (form.customImageUrl) {
      formData.append('customImageUrl', form.customImageUrl);
    }
    if (selectedFile) {
      formData.append('image', selectedFile);
    }

    try {
      if (editingPhoto) {
        await galleryApi.update(editingPhoto._id, formData);
        setStatusMsg({ type: 'success', text: 'Photo updated successfully.' });
      } else {
        await galleryApi.upload(formData);
        setStatusMsg({ type: 'success', text: 'Photo uploaded successfully!' });
      }
      setUploadModalOpen(false);
      fetchGallery();
    } catch (err) {
      setStatusMsg({
        type: 'error',
        text: err.response?.data?.message || 'Failed to save photo. Ensure an image is provided.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-cinematic font-bold text-white tracking-wide">
            Gallery Management
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 font-light">
            Upload new high-resolution photos to Cloudinary & MongoDB. Automatically updates public gallery.
          </p>
        </div>

        <button
          onClick={handleOpenUpload}
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-brand-accent hover:bg-rose-700 text-white text-xs font-bold uppercase tracking-wider shadow-glow-red transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Photo</span>
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

      {/* Gallery Photos Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-64 bg-slate-900/60 rounded-2xl animate-pulse border border-slate-800" />
          ))}
        </div>
      ) : photos.length === 0 ? (
        <div className="p-16 text-center rounded-3xl bg-brand-card border border-slate-800 text-slate-500 text-sm">
          <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
          No photos found in gallery. Click "Upload Photo" to add your first showcase photograph.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {photos.map((photo) => (
            <div
              key={photo._id}
              className="group relative rounded-2xl overflow-hidden bg-brand-card border border-slate-800 hover:border-slate-700 shadow-xl flex flex-col justify-between"
            >
              <div className="relative h-48 overflow-hidden bg-slate-950">
                <img
                  src={getMediaUrl(photo.imageUrl)}
                  alt={photo.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                {photo.isFeatured && (
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-amber-500 text-black flex items-center space-x-1 shadow">
                    <Sparkles className="w-2.5 h-2.5" />
                    <span>Featured</span>
                  </span>
                )}
                <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase bg-black/70 text-white border border-white/20">
                  {photo.category}
                </span>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-white truncate">{photo.title}</h4>
                  {photo.description && (
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 font-light">
                      {photo.description}
                    </p>
                  )}
                </div>

                <div className="pt-3 mt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 font-mono truncate max-w-[100px]">
                    {photo.cloudinaryId ? 'Cloud' : 'URL/Local'}
                  </span>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleOpenEdit(photo)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                      title="Edit Details"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(photo._id)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/60 text-slate-400 hover:text-rose-300"
                      title="Delete Photo"
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

      {/* Upload / Edit Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="max-w-lg w-full my-auto rounded-3xl bg-brand-navy border border-slate-700 p-5 sm:p-8 space-y-5 sm:space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-xl font-cinematic font-bold text-white">
                {editingPhoto ? 'Edit Photo Details' : 'Upload To Gallery'}
              </h3>
              <button
                onClick={() => setUploadModalOpen(false)}
                className="p-2 rounded-full text-slate-400 hover:text-white bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold uppercase tracking-wider mb-1.5">
                  Photo Title *
                </label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Royal Vows under Starlight"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-brand-accent"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold uppercase tracking-wider mb-1.5">
                  Category *
                </label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-brand-accent cursor-pointer"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold uppercase tracking-wider mb-1.5">
                  Upload Image File (Cloudinary / Storage)
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 text-xs focus:outline-none file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-brand-accent file:text-white cursor-pointer"
                />
              </div>

              <div className="text-center text-slate-500 font-bold uppercase tracking-widest text-[10px]">
                — OR PROVIDE DIRECT PHOTO URL —
              </div>

              <div>
                <label className="block text-slate-300 font-semibold uppercase tracking-wider mb-1.5">
                  Direct Image URL (e.g. Unsplash CDN link)
                </label>
                <input
                  type="url"
                  value={form.customImageUrl}
                  onChange={(e) => setForm({ ...form, customImageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-brand-accent"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold uppercase tracking-wider mb-1.5">
                  Description / Story Note
                </label>
                <textarea
                  rows="2"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Atmosphere, emotion, camera gear used..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-brand-accent resize-none"
                ></textarea>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="featuredCheck"
                  checked={form.isFeatured}
                  onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                  className="rounded border-slate-700 text-brand-accent focus:ring-brand-accent w-4 h-4 cursor-pointer"
                />
                <label htmlFor="featuredCheck" className="text-xs text-slate-300 cursor-pointer">
                  Feature this photograph prominently in highlight sections
                </label>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setUploadModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 rounded-xl bg-brand-accent hover:bg-rose-700 text-white text-xs font-bold uppercase tracking-wider shadow-glow-red disabled:opacity-50"
                >
                  {submitting ? 'Processing...' : editingPhoto ? 'Save Changes' : 'Upload Now'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminGallery;
