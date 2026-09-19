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
  Lock,
  Unlock,
  Plus,
  CalendarCheck,
} from 'lucide-react';
import { bookingsApi } from '../../api/client';

const statusFilters = ['All', 'Confirmed', 'Pending', 'Blocked Dates', 'Completed', 'Cancelled', 'Rejected'];

const timeSlotOptions = [
  { id: 'Full Day (All Day Coverage)', label: 'Full Day (Entire Day Blocked)' },
  { id: 'Morning (08:00 AM - 01:00 PM)', label: 'Morning Slot (08:00 AM - 01:00 PM)' },
  { id: 'Evening (04:00 PM - 10:00 PM)', label: 'Evening Slot (04:00 PM - 10:00 PM)' },
];

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

  // Block Date Modal state
  const [blockModalOpen, setBlockModalOpen] = useState(false);
  const [submittingBlock, setSubmittingBlock] = useState(false);
  const [blockForm, setBlockForm] = useState({
    date: new Date().toISOString().split('T')[0],
    slot: 'Full Day (All Day Coverage)',
    reason: '',
    notes: '',
  });

  const todayStr = new Date().toISOString().split('T')[0];

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await bookingsApi.getAll({
        status: activeFilter === 'Blocked Dates' ? 'Confirmed' : activeFilter,
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

  const handleDelete = async (id, isBlocked = false) => {
    const confirmPrompt = isBlocked
      ? 'Are you sure you want to unblock this date? Clients will immediately be able to book this date on the website.'
      : 'Are you sure you want to permanently delete this booking record?';

    if (!window.confirm(confirmPrompt)) return;

    try {
      await bookingsApi.delete(id);
      setActionSuccess(isBlocked ? 'Date unblocked successfully. Slot is now available for clients.' : 'Booking deleted successfully.');
      setSelectedBooking(null);
      fetchBookings();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to delete booking');
    }
  };

  const handleBlockSubmit = async (e) => {
    e.preventDefault();
    setSubmittingBlock(true);
    setActionError('');
    setActionSuccess('');

    try {
      const res = await bookingsApi.blockDate(blockForm);
      if (res.data && res.data.success) {
        setActionSuccess(`Date ${blockForm.date} has been blocked successfully! It will now show as 'Already Booked' to clients.`);
        setBlockModalOpen(false);
        setBlockForm({
          date: todayStr,
          slot: 'Full Day (All Day Coverage)',
          reason: '',
          notes: '',
        });
        fetchBookings();
      }
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to block date');
    } finally {
      setSubmittingBlock(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price || 0);
  };

  const getStatusBadge = (b) => {
    if (b.isBlockedDate) {
      return 'bg-purple-950 text-purple-300 border-purple-800';
    }
    switch (b.status) {
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

  // Client-side filtering for Blocked Dates or specific statuses
  const displayedBookings = bookings.filter((b) => {
    if (activeFilter === 'Blocked Dates') return b.isBlockedDate === true;
    if (activeFilter === 'Confirmed') return b.status === 'Confirmed' && !b.isBlockedDate;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-cinematic font-bold text-white tracking-wide">
            Bookings & Date Management
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 font-light">
            Manage customer reservations, view booked dates, and block off studio calendar dates in real time.
          </p>
        </div>

        <div className="flex items-center space-x-3 self-start sm:self-auto">
          <button
            onClick={() => setBlockModalOpen(true)}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-brand-accent hover:bg-rose-700 text-white text-xs font-bold uppercase tracking-wider shadow-glow-red transition-all"
          >
            <Lock className="w-4 h-4" />
            <span>Block / Reserve Date</span>
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-950/70 border border-emerald-500 text-emerald-200 text-xs flex items-center justify-between animate-fadeIn">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess('')} className="p-1 text-slate-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {actionError && (
        <div className="p-3.5 rounded-xl bg-rose-950/70 border border-rose-500 text-rose-200 text-xs flex items-center justify-between animate-fadeIn">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{actionError}</span>
          </div>
          <button onClick={() => setActionError('')} className="p-1 text-slate-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
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
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors flex items-center space-x-1 ${
                activeFilter === st
                  ? 'bg-brand-accent text-white shadow-glow-red'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {st === 'Blocked Dates' && <Lock className="w-3 h-3" />}
              <span>{st}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Bookings Table / List */}
      <div className="rounded-2xl bg-brand-card border border-slate-800 overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm animate-pulse">
            Loading reservations and calendar slots...
          </div>
        ) : displayedBookings.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm space-y-2">
            <p>No bookings or blocked dates found matching your criteria.</p>
            {activeFilter === 'Blocked Dates' && (
              <p className="text-xs text-slate-400">
                Click "Block / Reserve Date" to manually reserve a day or lock it for offline events.
              </p>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Booking Ref</th>
                  <th className="py-3.5 px-4">Client / Reason</th>
                  <th className="py-3.5 px-4">Event & Package</th>
                  <th className="py-3.5 px-4">Date & Slot</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {displayedBookings.map((b) => (
                  <tr key={b._id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-amber-400">
                      {b.bookingReference}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white">{b.customerName}</div>
                      <div className="text-slate-400 text-[11px]">
                        {b.isBlockedDate ? (
                          <span className="text-purple-400 font-medium">Studio Calendar Block</span>
                        ) : (
                          b.customerPhone
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-1.5">
                        <span className="text-slate-200 font-medium">
                          {b.isCustomEvent && b.customEventName ? b.customEventName : b.eventType}
                        </span>
                        {b.isCustomEvent && (
                          <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-[9px] border border-amber-500/30 uppercase">
                            Custom
                          </span>
                        )}
                      </div>
                      <div className="text-slate-400 text-[11px]">
                        {b.packageName}{' '}
                        {b.packagePrice > 0 ? (
                          `(${formatPrice(b.packagePrice)})`
                        ) : b.isCustomEvent ? (
                          <span className="text-amber-400 font-semibold">(Quote within 24h)</span>
                        ) : (
                          ''
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-1.5">
                        <span className="text-white font-mono font-bold">{b.eventDate}</span>
                        {b.isMultiDay && (
                          <span className="px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 font-bold text-[9px] border border-amber-400/40">
                            {b.totalDays || b.eventDates?.length || 1} Days
                          </span>
                        )}
                      </div>
                      {b.dayShifts && b.dayShifts.length > 0 ? (
                        <div className="text-[10px] text-amber-300/90 truncate max-w-[190px]">
                          {b.dayShifts.map((ds, idx) => `D${idx + 1}: ${ds.timeSlot.split(' ')[0]}`).join(' • ')}
                        </div>
                      ) : b.isMultiDay && b.eventDates && b.eventDates.length > 1 ? (
                        <div className="text-[10px] text-slate-400 truncate max-w-[180px]">
                          {b.eventDates.join(', ')}
                        </div>
                      ) : (
                        <div className="text-amber-400/80 text-[11px] truncate max-w-[160px]">
                          {b.eventTimeSlot}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getStatusBadge(
                          b
                        )}`}
                      >
                        {b.isBlockedDate && <Lock className="w-2.5 h-2.5" />}
                        <span>{b.isBlockedDate ? 'Studio Blocked' : b.status}</span>
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

                        {b.isBlockedDate ? (
                          <button
                            onClick={() => handleDelete(b._id, true)}
                            className="p-1.5 rounded-lg bg-purple-900/60 hover:bg-purple-800 text-purple-300"
                            title="Unblock this Date (make available to clients)"
                          >
                            <Unlock className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <>
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
                              onClick={() => handleDelete(b._id, false)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-900/60 text-slate-400 hover:text-red-300"
                              title="Delete Record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Block / Reserve A Date (Admin) */}
      {blockModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="max-w-lg w-full my-auto rounded-3xl bg-brand-navy border border-slate-700/80 p-5 sm:p-7 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-brand-accent font-bold block">
                  Calendar Management
                </span>
                <h3 className="text-xl font-cinematic font-bold text-white flex items-center space-x-2">
                  <Lock className="w-5 h-5 text-amber-400" />
                  <span>Block / Reserve Date</span>
                </h3>
              </div>
              <button
                onClick={() => setBlockModalOpen(false)}
                className="p-2 rounded-full text-slate-400 hover:text-white bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-800">
              When you block a date or slot here, it will <strong>immediately display as "Already Booked"</strong> to all clients on the website, preventing double bookings.
            </p>

            <form onSubmit={handleBlockSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold uppercase tracking-wider mb-1.5">
                  Select Date to Block *
                </label>
                <input
                  type="date"
                  required
                  min={todayStr}
                  value={blockForm.date}
                  onChange={(e) => setBlockForm({ ...blockForm, date: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-brand-accent"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold uppercase tracking-wider mb-1.5">
                  Scope / Slot to Lock *
                </label>
                <select
                  value={blockForm.slot}
                  onChange={(e) => setBlockForm({ ...blockForm, slot: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-brand-accent cursor-pointer"
                >
                  {timeSlotOptions.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold uppercase tracking-wider mb-1.5">
                  Reason / Client Reference *
                </label>
                <input
                  type="text"
                  required
                  value={blockForm.reason}
                  onChange={(e) => setBlockForm({ ...blockForm, reason: e.target.value })}
                  placeholder="e.g. Reserved for Verma Wedding (Booked Offline), Studio Closed"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-brand-accent"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold uppercase tracking-wider mb-1.5">
                  Internal Notes (Optional)
                </label>
                <textarea
                  rows="2"
                  value={blockForm.notes}
                  onChange={(e) => setBlockForm({ ...blockForm, notes: e.target.value })}
                  placeholder="Advance payment collected, client phone number, venue details..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-brand-accent resize-none"
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setBlockModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingBlock}
                  className="px-6 py-2.5 rounded-xl bg-brand-accent hover:bg-rose-700 text-white text-xs font-bold uppercase tracking-wider shadow-glow-red disabled:opacity-50 flex items-center space-x-1.5"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{submittingBlock ? 'Locking Date...' : 'Lock Date Now'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Full Booking Details View & Status Operations */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="max-w-xl w-full my-auto rounded-3xl bg-brand-navy border border-slate-700 p-5 sm:p-8 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest block">
                  {selectedBooking.isBlockedDate ? 'Studio Calendar Lock' : 'Booking Details'}
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-400 uppercase text-[10px] block">
                  {selectedBooking.isBlockedDate ? 'Lock Reason / Client' : 'Customer'}
                </span>
                <span className="text-sm font-semibold text-white break-words">{selectedBooking.customerName}</span>
                {!selectedBooking.isBlockedDate && (
                  <>
                    <div className="mt-1 text-slate-300">{selectedBooking.customerPhone}</div>
                    <div className="text-slate-400 break-all">{selectedBooking.customerEmail}</div>
                  </>
                )}
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-400 uppercase text-[10px] block">Event & Package</span>
                <div className="flex items-center space-x-1.5">
                  <span className="text-sm font-semibold text-amber-400">
                    {selectedBooking.isCustomEvent && selectedBooking.customEventName
                      ? selectedBooking.customEventName
                      : selectedBooking.eventType}
                  </span>
                  {selectedBooking.isCustomEvent && (
                    <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold text-[9px] uppercase border border-amber-500/30">
                      Custom
                    </span>
                  )}
                </div>
                <div className="mt-1 text-white">{selectedBooking.packageName}</div>
                {selectedBooking.packagePrice > 0 ? (
                  <div className="text-emerald-400 font-bold font-cinematic">
                    {formatPrice(selectedBooking.packagePrice)}
                  </div>
                ) : selectedBooking.isCustomEvent ? (
                  <div className="text-amber-400 text-[11px] font-semibold mt-1">
                    ⚡ Quote within 24 hrs
                  </div>
                ) : null}
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-400 uppercase text-[10px] block">
                  {selectedBooking.isMultiDay ? `Celebration Dates (${selectedBooking.totalDays || selectedBooking.eventDates?.length || 1} Days)` : 'Date & Time'}
                </span>
                {selectedBooking.isMultiDay && selectedBooking.eventDates && selectedBooking.eventDates.length > 0 ? (
                  <div className="space-y-1 mt-1">
                    {selectedBooking.eventDates.map((d, i) => {
                      const shift = (selectedBooking.dayShifts || []).find((ds) => ds.date === d)?.timeSlot || selectedBooking.eventTimeSlot || 'Full Day';
                      return (
                        <div key={d} className="flex items-center justify-between text-[11px]">
                          <span className="font-mono text-amber-300 font-bold">D{i + 1}: {d}</span>
                          <span className="text-slate-300 font-medium">{shift.split(' ')[0]} Shift</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <>
                    <span className="text-sm font-semibold text-white font-mono">{selectedBooking.eventDate}</span>
                    <div className="text-slate-300 mt-1 text-[11px]">{selectedBooking.eventTimeSlot}</div>
                  </>
                )}
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-400 uppercase text-[10px] block">Location</span>
                <span className="text-xs text-white break-words">{selectedBooking.eventLocation}</span>
              </div>
            </div>

            {selectedBooking.additionalMessage && (
              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300">
                <span className="text-[10px] uppercase text-slate-500 font-bold block mb-1">
                  {selectedBooking.isBlockedDate ? 'Internal Notes' : 'Customer Vision / Message'}
                </span>
                "{selectedBooking.additionalMessage}"
              </div>
            )}

            {/* Status Change Buttons */}
            {!selectedBooking.isBlockedDate ? (
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
            ) : (
              <div className="pt-4 border-t border-slate-800 flex justify-end">
                <button
                  onClick={() => handleDelete(selectedBooking._id, true)}
                  className="px-4 py-2 rounded-xl bg-purple-900/80 hover:bg-purple-800 text-white text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5"
                >
                  <Unlock className="w-4 h-4" />
                  <span>Unblock This Date</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBookings;
