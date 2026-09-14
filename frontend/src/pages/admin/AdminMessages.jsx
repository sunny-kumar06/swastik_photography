import React, { useState, useEffect } from 'react';
import { Mail, Phone, Calendar, Trash2, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { contactApi } from '../../api/client';

const AdminMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState(null);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await contactApi.getAll();
      if (res.data && res.data.data) {
        setMessages(res.data.data);
      }
    } catch (err) {
      console.error('[Messages fetch error]:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await contactApi.markRead(id);
      fetchMessages();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this message?')) return;
    try {
      await contactApi.delete(id);
      setStatusMsg('Message deleted successfully.');
      fetchMessages();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-cinematic font-bold text-white tracking-wide">
          Direct Messages & Enquiries
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 font-light">
          Customer submissions received from the public website contact form.
        </p>
      </div>

      {statusMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-950/70 border border-emerald-500 text-emerald-200 text-xs">
          {statusMsg}
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-32 rounded-2xl bg-slate-900/60 animate-pulse border border-slate-800" />
          ))}
        </div>
      ) : messages.length === 0 ? (
        <div className="p-16 text-center rounded-3xl bg-brand-card border border-slate-800 text-slate-500 text-sm">
          No contact inquiries in inbox yet.
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg._id}
              className={`p-6 rounded-2xl bg-brand-card border transition-all ${
                msg.isRead ? 'border-slate-800' : 'border-amber-500/40 bg-slate-900/80 shadow-glow-gold'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-3 border-b border-slate-800">
                <div className="flex items-center space-x-3">
                  <h4 className="text-base font-cinematic font-bold text-white">{msg.name}</h4>
                  {!msg.isRead && (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-amber-500 text-black">
                      New
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-4 text-xs text-slate-400">
                  <span className="flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{new Date(msg.createdAt).toLocaleDateString()}</span>
                  </span>
                  <div className="flex items-center space-x-1">
                    {!msg.isRead && (
                      <button
                        onClick={() => handleMarkRead(msg._id)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs"
                        title="Mark as Read"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(msg._id)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/60 text-slate-400 hover:text-rose-300"
                      title="Delete Message"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mb-3">
                <a href={`tel:${msg.phone}`} className="flex items-center space-x-1 hover:text-white">
                  <Phone className="w-3.5 h-3.5 text-brand-accent" />
                  <span>{msg.phone}</span>
                </a>
                <a href={`mailto:${msg.email}`} className="flex items-center space-x-1 hover:text-white">
                  <Mail className="w-3.5 h-3.5 text-rose-400" />
                  <span>{msg.email}</span>
                </a>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800/80 text-xs sm:text-sm text-slate-200">
                "{msg.message}"
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminMessages;
