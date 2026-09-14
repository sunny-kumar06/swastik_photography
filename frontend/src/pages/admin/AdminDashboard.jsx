import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Image as ImageIcon,
  Mail,
  ArrowRight,
  TrendingUp,
  MapPin,
  Eye,
} from 'lucide-react';
import { bookingsApi } from '../../api/client';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await bookingsApi.getDashboardStats();
      if (res.data && res.data.data) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error('[Dashboard stats error]:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price || 0);
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-64 bg-slate-800 rounded-lg" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-28 bg-slate-900 rounded-2xl border border-slate-800" />
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Bookings',
      value: stats?.totalBookings || 0,
      icon: Calendar,
      color: 'text-sky-400',
      bg: 'bg-sky-500/10 border-sky-500/20',
      link: '/admin/bookings',
    },
    {
      title: 'Pending Inquiries',
      value: stats?.pendingBookings || 0,
      icon: Clock,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/20',
      link: '/admin/bookings?status=Pending',
    },
    {
      title: 'Confirmed Shoots',
      value: stats?.confirmedBookings || 0,
      icon: CheckCircle2,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
      link: '/admin/bookings?status=Confirmed',
    },
    {
      title: 'Gallery Photos',
      value: stats?.totalPhotos || 0,
      icon: ImageIcon,
      color: 'text-pink-400',
      bg: 'bg-pink-500/10 border-pink-500/20',
      link: '/admin/gallery',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-cinematic font-bold text-white tracking-wide">
            Studio Overview
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 font-light">
            Real-time status of bookings, shooting schedules, and inquiries.
          </p>
        </div>

        <Link
          to="/admin/bookings"
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-brand-accent hover:bg-rose-700 text-white text-xs font-bold uppercase tracking-wider transition-all self-start sm:self-auto shadow-glow-red"
        >
          <span>Manage Bookings</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.title}
              to={card.link}
              className={`p-5 sm:p-6 rounded-2xl bg-brand-card border border-slate-800 hover:border-slate-700 transition-all group ${card.bg}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {card.title}
                </span>
                <Icon className={`w-5 h-5 ${card.color}`} />
              </div>
              <div className="text-2xl sm:text-4xl font-extrabold font-cinematic text-white mt-3">
                {card.value}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Two Column Layout: Recent Bookings & Upcoming Events */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Col: Recent Bookings */}
        <div className="lg:col-span-7 rounded-3xl bg-brand-card/90 border border-slate-800 p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-lg font-cinematic font-bold text-white">
                Recent Booking Inquiries
              </h3>
              <span className="text-xs text-slate-400">Latest customer date requests</span>
            </div>
            <Link
              to="/admin/bookings"
              className="text-xs text-brand-accent hover:text-rose-400 font-semibold"
            >
              View All →
            </Link>
          </div>

          {!stats?.recentBookings || stats.recentBookings.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              No bookings logged yet.
            </div>
          ) : (
            <div className="space-y-3">
              {stats.recentBookings.map((b) => (
                <div
                  key={b._id}
                  className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 flex items-center justify-between transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono font-bold text-amber-400">
                        {b.bookingReference}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          b.status === 'Confirmed'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : b.status === 'Pending'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {b.status}
                      </span>
                    </div>
                    <div className="text-sm font-semibold text-white">
                      {b.customerName}
                    </div>
                    <div className="text-xs text-slate-400 flex items-center space-x-2">
                      <span>{b.eventType}</span>
                      <span>•</span>
                      <span>{b.eventDate}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-bold text-emerald-400 font-cinematic">
                      {formatPrice(b.packagePrice)}
                    </div>
                    <Link
                      to={`/admin/bookings?search=${b.bookingReference}`}
                      className="text-xs text-slate-400 hover:text-white inline-flex items-center space-x-1 mt-1"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Details</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Col: Upcoming Events Calendar */}
        <div className="lg:col-span-5 rounded-3xl bg-brand-card/90 border border-slate-800 p-6 sm:p-8">
          <div className="mb-6 pb-4 border-b border-slate-800">
            <h3 className="text-lg font-cinematic font-bold text-white">
              Upcoming Event Shoots
            </h3>
            <span className="text-xs text-slate-400">Schedule from today onwards</span>
          </div>

          {!stats?.upcomingEvents || stats.upcomingEvents.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              No upcoming confirmed shoots currently scheduled.
            </div>
          ) : (
            <div className="space-y-3">
              {stats.upcomingEvents.map((event) => (
                <div
                  key={event._id}
                  className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start space-x-3"
                >
                  <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex flex-col items-center justify-center text-center flex-shrink-0">
                    <Calendar className="w-4 h-4 text-brand-accent" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white truncate">
                        {event.eventType}
                      </span>
                      <span className="text-[10px] text-amber-400 font-mono">
                        {event.eventDate}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 truncate mt-0.5">
                      {event.customerName}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate flex items-center space-x-1 mt-0.5">
                      <MapPin className="w-3 h-3 flex-shrink-0" />
                      <span>{event.eventLocation}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
