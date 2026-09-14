import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  Check,
  X,
  Clock,
  Trash2,
  Eye,
  Calendar,
  Phone,
  Mail,
  MapPin,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { bookingsApi } from '../../api/client';

const statusFilters = ['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled', 'Rejected'];

const AdminBookings = () => {
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const initialStatus = searchParams.get('status') || 'All';

  const [bookings, setBookings] = useState([]);
  const [search, setSearch] = useState(initialSearch);
  const [activeFilter, setActiveFilter] = useState(initialStatus);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await bookingsApi.getAll({
        status: activeFilter,
        search,
      });
      if (res.data && res.data.data) {
        setBookings(res.data.data);
      }
    } catch (err) {
      console.error('[Bookings fetch error]:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [activeFilter, search]);

  const handleStatusChange = async (id, newStatus) => {
    setActionError('');
    setActionSuccess('');
    try {
      const res = await bookingsApi.updateStatus(id, { status: newStatus });
      if (res.data && res.data.success) {
        setActionSuccess(`Booking updated to ${newStatus}`);
        fetchBookings();
        if (selectedBooking && selectedBooking._id === id) {
          setSelectedBooking(res.data.data);
        }
      }
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to update booking status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this booking record?')) return;
    try {
      await bookingsApi.delete(id);
      setActionSuccess('Booking deleted successfully.');
      setSelectedBooking(null);
      fetchBookings();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to delete booking');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price || 0);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Confirmed':
        return 'bg-emerald-950 text-emerald-300 border-emerald-800';
      case 'Pending':
        return 'bg-amber-950 text-amber-300 border-amber-800';
      case 'Completed':
        return 'bg-blue-950 text-blue-300 border-blue-800';
      case 'Rejected':
      case 'Cancelled':
        return 'bg-rose-950 text-rose-300 border-rose-800';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-cinematic font-bold text-white tracking-wide">
            Bookings & Reservations
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 font-light">
            Monitor, approve, reschedule, or cancel customer photoshoot requests.
          </p>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-950/70 border border-emerald-500 text-emerald-200 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {actionError && (
        <div className="p-3.5 rounded-xl bg-rose-950/70 border border-rose-500 text-rose-200 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-brand-card border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search input */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, phone, ref..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-brand-accent transition-colors"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {statusFilters.map((st) => (
            <button
              key={st}
              onClick={() => setActiveFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors ${
                activeFilter === st
                  ? 'bg-brand-accent text-white shadow-glow-red'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings Table / List */}
      <div className="rounded-2xl bg-brand-card border border-slate-800 overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            Loading reservations...
          </div>
        ) : bookings.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            No bookings found matching your search and filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Booking Ref</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Event & Package</th>
                  <th className="py-3.5 px-4">Date & Slot</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {bookings.map((b) => (
                  <tr key={b._id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-amber-400">
                      {b.bookingReference}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white">{b.customerName}</div>
                      <div className="text-slate-400 text-[11px]">{b.customerPhone}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-slate-200 font-medium">{b.eventType}</div>
                      <div className="text-slate-400 text-[11px]">
                        {b.packageName} ({formatPrice(b.packagePrice)})
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-white font-medium">{b.eventDate}</div>
                      <div className="text-amber-400/80 text-[11px] truncate max-w-[160px]">
                        {b.eventTimeSlot}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getStatusBadge(
                          b.status
                        )}`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => setSelectedBooking(b)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                          title="View Full Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {b.status !== 'Confirmed' && (
                          <button
                            onClick={() => handleStatusChange(b._id, 'Confirmed')}
                            className="p-1.5 rounded-lg bg-emerald-900/60 hover:bg-emerald-800 text-emerald-300"
                            title="Confirm Booking"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {b.status !== 'Rejected' && (
                          <button
                            onClick={() => handleStatusChange(b._id, 'Rejected')}
                            className="p-1.5 rounded-lg bg-rose-900/60 hover:bg-rose-800 text-rose-300"
                            title="Reject Booking"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(b._id)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-900/60 text-slate-400 hover:text-red-300"
                          title="Delete Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Full Booking Details View & Status Operations */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="max-w-xl w-full rounded-3xl bg-brand-navy border border-slate-700 p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest block">
                  Booking Details
                </span>
                <h3 className="text-xl font-cinematic font-bold text-white">
                  Ref: {selectedBooking.bookingReference}
                </h3>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="p-2 rounded-full text-slate-400 hover:text-white bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-400 uppercase text-[10px] block">Customer</span>
                <span className="text-sm font-semibold text-white">{selectedBooking.customerName}</span>
                <div className="mt-1 text-slate-300">{selectedBooking.customerPhone}</div>
                <div className="text-slate-400 truncate">{selectedBooking.customerEmail}</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-400 uppercase text-[10px] block">Event & Package</span>
                <span className="text-sm font-semibold text-amber-400">{selectedBooking.eventType}</span>
                <div className="mt-1 text-white">{selectedBooking.packageName}</div>
                <div className="text-emerald-400 font-bold font-cinematic">
                  {formatPrice(selectedBooking.packagePrice)}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-400 uppercase text-[10px] block">Date & Time</span>
                <span className="text-sm font-semibold text-white">{selectedBooking.eventDate}</span>
                <div className="text-slate-300 mt-1">{selectedBooking.eventTimeSlot}</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-400 uppercase text-[10px] block">Location</span>
                <span className="text-xs text-white">{selectedBooking.eventLocation}</span>
              </div>
            </div>

            {selectedBooking.additionalMessage && (
              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300">
                <span className="text-[10px] uppercase text-slate-500 font-bold block mb-1">
                  Customer Vision / Message
                </span>
                "{selectedBooking.additionalMessage}"
              </div>
            )}

            {/* Status Change Buttons */}
            <div className="pt-4 border-t border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-2">
                Set Current Booking Status:
              </span>
              <div className="flex flex-wrap gap-2">
                {['Pending', 'Confirmed', 'Completed', 'Cancelled', 'Rejected'].map((st) => (
                  <button
                    key={st}
                    onClick={() => handleStatusChange(selectedBooking._id, st)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${
                      selectedBooking.status === st
                        ? 'bg-brand-accent text-white shadow-glow-red'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBookings;
