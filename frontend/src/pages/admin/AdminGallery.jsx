import React, { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Edit3,
  Image as ImageIcon,
  Sparkles,
  X,
  CheckCircle2,
  AlertCircle,
  UploadCloud,
  Copy,
  Check,
  Filter,
  RefreshCw,
  Eye,
} from 'lucide-react';
import { galleryApi, getMediaUrl } from '../../api/client';
import { compressImage, formatFileSize } from '../../utils/imageCompressor';
import OptimizedImage from '../../components/common/OptimizedImage';

const categories = ['Wedding', 'Pre-Wedding', 'Birthday', 'Engagement', 'Portrait', 'Cinematic', 'Other'];

const AdminGallery = () => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState(null);
  const [statusMsg, setStatusMsg] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [copiedId, setCopiedId] = useState(null);

  // Form State
  const [form, setForm] = useState({
    title: '',
    category: 'Wedding',
    description: '',
    isFeatured: false,
    customImageUrl: '',
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState('');
  const [fileStats, setFileStats] = useState(null);

  const fetchGallery = async () => {
    setLoading(true);
    try {
      const res = await galleryApi.getAll();
      if (res.data && res.data.data) {
        setPhotos(res.data.data);
      }
    } catch (err) {
      console.error('[Gallery fetch error]:', err.message);
      setStatusMsg({
        type: 'error',
        text: 'Failed to load gallery photos. Please check your backend connection.',
      });
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
    setFilePreview('');
    setFileStats(null);
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
    setFilePreview(getMediaUrl(photo.imageUrl));
    setFileStats(null);
    setUploadModalOpen(true);
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    setCompressing(true);
    try {
      // Compress raw camera/phone photo to web-optimized JPEG under 450KB
      const result = await compressImage(file, { maxWidth: 1920, maxHeight: 1920, quality: 0.82 });
      setSelectedFile(result.file);
      setFilePreview(result.previewUrl);
      setFileStats({
        originalSize: result.originalSize,
        compressedSize: result.compressedSize,
        reductionPercent: result.reductionPercent,
      });
    } catch (err) {
      console.warn('[Image compression failed, using original]:', err);
      setSelectedFile(file);
      setFilePreview(URL.createObjectURL(file));
      setFileStats({
        originalSize: file.size,
        compressedSize: file.size,
        reductionPercent: 0,
      });
    } finally {
      setCompressing(false);
    }
  };

  const handleClearSelectedFile = () => {
    setSelectedFile(null);
    setFilePreview('');
    setFileStats(null);
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

  const handleCopyUrl = (id, url) => {
    const fullUrl = getMediaUrl(url);
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setStatusMsg(null);

    const formData = new FormData();
    formData.append('title', form.title.trim());
    formData.append('category', form.category);
    formData.append('description', form.description.trim());
    formData.append('isFeatured', form.isFeatured);

    if (form.customImageUrl) {
      formData.append('customImageUrl', form.customImageUrl.trim());
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
        setStatusMsg({
          type: 'success',
          text: `Photo uploaded successfully! ${
            fileStats?.reductionPercent ? `Optimized by ${fileStats.reductionPercent}% for high-speed delivery.` : ''
          }`,
        });
      }
      setUploadModalOpen(false);
      fetchGallery();
    } catch (err) {
      console.error('[Upload error]:', err);
      setStatusMsg({
        type: 'error',
        text: err.response?.data?.message || 'Failed to save photo. Please try again.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredPhotos =
    activeCategory === 'All'
      ? photos
      : photos.filter((p) => p.category?.toLowerCase() === activeCategory.toLowerCase());

  return (
    <div className="space-y-6">
      {/* Page Title & Upload Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-cinematic font-bold text-white tracking-wide">
            Gallery Management
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 font-light">
            Fast, high-performance photo uploads with instant client-side optimization and automatic public portfolio sync.
          </p>
        </div>

        <div className="flex items-center space-x-3 self-start sm:self-auto">
          <button
            onClick={fetchGallery}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700/60"
            title="Refresh gallery"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleOpenUpload}
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-brand-accent hover:bg-rose-700 text-white text-xs font-bold uppercase tracking-wider shadow-glow-red transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Upload Photo</span>
          </button>
        </div>
      </div>

      {/* Status Alerts */}
      {statusMsg && (
        <div
          className={`p-4 rounded-2xl text-xs flex items-center justify-between space-x-2 animate-fadeIn ${
            statusMsg.type === 'success'
              ? 'bg-emerald-950/70 border border-emerald-500/70 text-emerald-200'
              : 'bg-rose-950/70 border border-rose-500/70 text-rose-200'
          }`}
        >
          <div className="flex items-center space-x-2.5">
            {statusMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
            )}
            <span className="font-medium">{statusMsg.text}</span>
          </div>
          <button
            onClick={() => setStatusMsg(null)}
            className="p-1 text-slate-400 hover:text-white rounded-lg"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Category Filter Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center space-x-1 pl-1 pr-2 flex-shrink-0">
          <Filter className="w-3 h-3" />
          <span>Filter:</span>
        </span>
        {['All', ...categories].map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeCategory === cat
                ? 'bg-brand-accent text-white shadow-sm'
                : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {cat} {cat === 'All' ? `(${photos.length})` : ''}
          </button>
        ))}
      </div>

      {/* Gallery Photos Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div key={n} className="h-64 bg-slate-900/60 rounded-2xl animate-pulse border border-slate-800" />
          ))}
        </div>
      ) : filteredPhotos.length === 0 ? (
        <div className="p-16 text-center rounded-3xl bg-brand-card border border-slate-800 text-slate-400 text-sm space-y-3">
          <ImageIcon className="w-12 h-12 mx-auto text-slate-600" />
          <p className="font-medium text-slate-300">
            {photos.length === 0
              ? 'No photos found in gallery.'
              : `No photos found in category "${activeCategory}".`}
          </p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Click "Upload Photo" to add a photograph with instant client-side compression.
          </p>
          <button
            onClick={handleOpenUpload}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-brand-accent text-white text-xs font-semibold uppercase tracking-wider"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Photograph</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredPhotos.map((photo) => (
            <div
              key={photo._id}
              className="group relative rounded-2xl overflow-hidden bg-brand-card border border-slate-800 hover:border-slate-700 shadow-xl flex flex-col justify-between transition-all hover:shadow-2xl"
            >
              {/* Image Preview with Fallback */}
              <div className="relative h-48 overflow-hidden bg-slate-950">
                <OptimizedImage
                  src={photo.imageUrl}
                  alt={photo.title}
                  width={600}
                  quality={70}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  containerClassName="w-full h-full"
                />

                {photo.isFeatured && (
                  <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase bg-amber-500 text-black flex items-center space-x-1 shadow-md">
                    <Sparkles className="w-2.5 h-2.5" />
                    <span>Featured</span>
                  </span>
                )}

                <span className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full text-[9px] font-semibold uppercase bg-black/75 text-white border border-white/20 backdrop-blur-sm">
                  {photo.category}
                </span>
              </div>

              {/* Card Meta & Controls */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h4 className="text-sm font-semibold text-white truncate" title={photo.title}>
                    {photo.title}
                  </h4>
                  {photo.description ? (
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 font-light">
                      {photo.description}
                    </p>
                  ) : (
                    <p className="text-[11px] text-slate-600 mt-1 italic">No description provided</p>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 font-mono flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                    <span className="truncate max-w-[90px]">
                      {photo.cloudinaryId ? 'Cloudinary' : 'Storage'}
                    </span>
                  </span>

                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => handleCopyUrl(photo._id, photo.imageUrl)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                      title="Copy photo URL"
                    >
                      {copiedId === photo._id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <button
                      onClick={() => handleOpenEdit(photo)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                      title="Edit Details"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleDelete(photo._id)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/60 text-slate-400 hover:text-rose-300 transition-colors"
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

      {/* Upload & Edit Modal with Real-Time Image Compression */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="max-w-xl w-full my-auto rounded-3xl bg-brand-navy border border-slate-700/80 p-5 sm:p-7 space-y-5 shadow-2xl max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-brand-accent font-bold">
                  Portfolio Asset
                </span>
                <h3 className="text-xl font-cinematic font-bold text-white">
                  {editingPhoto ? 'Edit Photo Details' : 'Upload To Gallery'}
                </h3>
              </div>
              <button
                onClick={() => !submitting && setUploadModalOpen(false)}
                disabled={submitting}
                className="p-2 rounded-full text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 transition-colors disabled:opacity-40"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Photo Title */}
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
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-brand-accent transition-colors"
                />
              </div>

              {/* Category Selection */}
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

              {/* Optimized Image Upload Section */}
              <div>
                <label className="block text-slate-300 font-semibold uppercase tracking-wider mb-1.5">
                  Select Photograph File
                </label>

                {compressing ? (
                  <div className="p-6 rounded-2xl border border-dashed border-brand-accent/60 bg-slate-900/70 text-center space-y-2">
                    <RefreshCw className="w-6 h-6 text-brand-accent animate-spin mx-auto" />
                    <p className="text-xs font-semibold text-white">Compressing & optimizing image...</p>
                    <p className="text-[11px] text-slate-400">
                      Scaling raw camera resolution to web-optimized format for blazing upload speeds.
                    </p>
                  </div>
                ) : filePreview && selectedFile ? (
                  <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-700/80 space-y-3">
                    <div className="flex items-center space-x-3">
                      <img
                        src={filePreview}
                        alt="Upload preview"
                        className="w-20 h-20 rounded-xl object-cover border border-slate-700 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-semibold text-white truncate">
                            {selectedFile.name}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            Optimized
                          </span>
                        </div>

                        {fileStats && (
                          <div className="mt-1.5 text-[11px] text-slate-400 space-y-0.5">
                            <div>
                              Original:{' '}
                              <span className="text-slate-300 font-mono">
                                {formatFileSize(fileStats.originalSize)}
                              </span>{' '}
                              → Compressed:{' '}
                              <span className="text-emerald-400 font-bold font-mono">
                                {formatFileSize(fileStats.compressedSize)}
                              </span>
                            </div>
                            {fileStats.reductionPercent > 0 && (
                              <div className="text-[10px] text-emerald-400 font-medium">
                                ⚡ {fileStats.reductionPercent}% smaller payload for instantaneous upload!
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={handleClearSelectedFile}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
                        title="Remove selection"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <label className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed border-slate-700 hover:border-brand-accent bg-slate-900/60 hover:bg-slate-900/90 transition-all cursor-pointer group">
                      <UploadCloud className="w-8 h-8 text-slate-400 group-hover:text-brand-accent transition-colors mb-2" />
                      <span className="text-xs font-semibold text-slate-200 group-hover:text-white">
                        Click or tap to choose a photo
                      </span>
                      <span className="text-[10px] text-slate-400 mt-1">
                        JPEG, PNG, WEBP — automatically compressed for fastest upload
                      </span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/jpg"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
              </div>

              {/* Direct Photo URL Fallback */}
              <div className="relative my-3">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-800" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest">
                  <span className="bg-brand-navy px-3 text-slate-500">
                    OR PROVIDE DIRECT IMAGE URL
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold uppercase tracking-wider mb-1.5">
                  Direct Photo URL (Unsplash, Cloud CDN link)
                </label>
                <input
                  type="url"
                  value={form.customImageUrl}
                  onChange={(e) => {
                    setForm({ ...form, customImageUrl: e.target.value });
                    if (e.target.value) {
                      setFilePreview(e.target.value);
                    }
                  }}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-brand-accent transition-colors font-mono"
                />
              </div>

              {/* Description / Note */}
              <div>
                <label className="block text-slate-300 font-semibold uppercase tracking-wider mb-1.5">
                  Description / Story Note
                </label>
                <textarea
                  rows="2"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Atmosphere, emotion, camera gear used..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-brand-accent resize-none transition-colors"
                />
              </div>

              {/* Featured Checkbox */}
              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="featuredCheck"
                  checked={form.isFeatured}
                  onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                  className="rounded border-slate-700 text-brand-accent focus:ring-brand-accent w-4 h-4 cursor-pointer"
                />
                <label htmlFor="featuredCheck" className="text-xs text-slate-300 cursor-pointer">
                  Feature this photograph prominently in highlight portfolio sections
                </label>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => setUploadModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting || compressing || (!selectedFile && !form.customImageUrl && !editingPhoto)}
                  className="px-6 py-2.5 rounded-xl bg-brand-accent hover:bg-rose-700 text-white text-xs font-bold uppercase tracking-wider shadow-glow-red disabled:opacity-50 transition-all flex items-center space-x-2"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Uploading & Saving...</span>
                    </>
                  ) : editingPhoto ? (
                    <span>Save Changes</span>
                  ) : (
                    <span>Upload Now</span>
                  )}
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
