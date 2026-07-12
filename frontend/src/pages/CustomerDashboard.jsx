import React, { useContext } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';
import DashboardLayout from '../layouts/DashboardLayout';
import { AuthContext } from '../context/AuthContext';
import { formatHumanDate, formatHumanTime } from '../utils/dateHelper';
import { PlusCircle, Sparkles, Utensils, Calendar, CheckCircle2, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const CustomerDashboard = () => {
  const { user } = useContext(AuthContext);

  const { data: reservationsResponse, isLoading } = useQuery({
    queryKey: ['myReservations'],
    queryFn: () => apiClient.get('/reservations/my'),
  });

  const reservations = reservationsResponse?.data || [];
  
  // Find the next upcoming confirmed reservation
  const todayStr = new Date().toLocaleDateString('en-CA');
  
  const upcomingReservations = reservations
    .filter(r => r.status === 'confirmed' && r.reservationDate >= todayStr)
    .sort((a, b) => {
      if (a.reservationDate !== b.reservationDate) {
        return a.reservationDate.localeCompare(b.reservationDate);
      }
      return a.startTime.localeCompare(b.startTime);
    });

  const nextReservation = upcomingReservations[0];

  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return 'Good Morning';
    if (hr < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <DashboardLayout>
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8 text-brand-text"
      >
        {/* Welcome Section */}
        <div>
          <h2 className="text-4xl font-bold font-serif tracking-tight">{getGreeting()}, {user?.name}</h2>
          <p className="text-brand-muted font-medium mt-1.5">Welcome back to Ram Dining. Let's arrange your next extraordinary evening.</p>
        </div>

        {/* Your Next Reservation Card - Luxury Invitation Layout */}
        <motion.div 
          variants={cardVariants}
          whileHover={{ y: -3 }}
          className="bg-white rounded-xl shadow-sm border border-brand-border overflow-hidden"
        >
          <div className="p-6 bg-gradient-to-r from-primary-500 to-orange-400 text-white flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5" />
              <h3 className="text-lg font-bold font-serif tracking-wide">Your Upcoming Reservation</h3>
            </div>
            <Link 
              to="/dashboard/book" 
              className="flex items-center gap-1.5 text-xs font-bold bg-white/25 hover:bg-white/35 text-white px-3 py-1.5 rounded-lg border border-white/10 transition-colors uppercase tracking-wider"
            >
              <PlusCircle className="h-4 w-4" />
              Reserve Table
            </Link>
          </div>

          <div className="p-8">
            {isLoading ? (
              <div className="flex items-center justify-center py-6">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-500 border-t-transparent"></div>
              </div>
            ) : nextReservation ? (
              <div className="space-y-6">
                {/* Visual Invitation Details */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 items-center">
                  <div className="bg-brand-bg p-5 rounded-xl border border-brand-border/60 text-center">
                    <span className="text-[10px] text-brand-muted font-bold uppercase tracking-widest block mb-1">Date</span>
                    <span className="text-base font-bold text-brand-text">{formatHumanDate(nextReservation.reservationDate)}</span>
                  </div>
                  
                  <div className="bg-brand-bg p-5 rounded-xl border border-brand-border/60 text-center">
                    <span className="text-[10px] text-brand-muted font-bold uppercase tracking-widest block mb-1">Time</span>
                    <span className="text-base font-bold text-brand-text">{formatHumanTime(nextReservation.startTime)}</span>
                  </div>

                  <div className="bg-brand-bg p-5 rounded-xl border border-brand-border/60 text-center">
                    <span className="text-[10px] text-brand-muted font-bold uppercase tracking-widest block mb-1">Guests</span>
                    <span className="text-base font-bold text-brand-text">{nextReservation.guestCount} People</span>
                  </div>

                  <div className="bg-brand-bg p-5 rounded-xl border border-brand-border/60 text-center">
                    <span className="text-[10px] text-brand-muted font-bold uppercase tracking-widest block mb-1">Table</span>
                    <span className="text-base font-bold text-brand-text">{nextReservation.tableId?.tableNumber}</span>
                  </div>
                </div>

                {nextReservation.notes && (
                  <div className="p-4 bg-brand-bg rounded-lg text-sm text-brand-muted border border-brand-border/50">
                    <span className="font-semibold text-brand-text">Special Requests:</span> "{nextReservation.notes}"
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Utensils className="h-10 w-10 text-brand-border mx-auto mb-3" />
                <p className="text-brand-muted font-medium mb-5">You don't have any tables reserved. Experience tonight's chef tasting menu.</p>
                <Link to="/dashboard/book" className="btn btn-primary px-6 py-3 font-bold text-xs tracking-wider uppercase">
                  Book a Table
                </Link>
              </div>
            )}
          </div>
        </motion.div>

        {/* Quick Stats Grid */}
        <motion.div variants={cardVariants} className="space-y-4">
          <h3 className="text-xl font-bold font-serif tracking-tight">Your Activity Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl border border-brand-border flex items-center justify-between shadow-sm">
              <div className="space-y-1">
                <span className="text-xs text-brand-muted font-bold uppercase tracking-wider">Total Bookings</span>
                <h4 className="text-3xl font-bold text-brand-text">{isLoading ? '...' : reservations.length}</h4>
              </div>
              <div className="h-10 w-10 rounded-lg bg-orange-50 flex items-center justify-center text-primary-500">
                <Calendar className="h-5 w-5" />
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl border border-brand-border flex items-center justify-between shadow-sm">
              <div className="space-y-1">
                <span className="text-xs text-brand-muted font-bold uppercase tracking-wider">Active Bookings</span>
                <h4 className="text-3xl font-bold text-green-700">
                  {isLoading ? '...' : reservations.filter(r => r.status === 'confirmed').length}
                </h4>
              </div>
              <div className="h-10 w-10 rounded-lg bg-green-50 flex items-center justify-center text-green-600">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-brand-border flex items-center justify-between shadow-sm">
              <div className="space-y-1">
                <span className="text-xs text-brand-muted font-bold uppercase tracking-wider">Past / Cancelled</span>
                <h4 className="text-3xl font-bold text-brand-muted">
                  {isLoading ? '...' : reservations.filter(r => r.status !== 'confirmed').length}
                </h4>
              </div>
              <div className="h-10 w-10 rounded-lg bg-gray-50 flex items-center justify-center text-brand-muted">
                <XCircle className="h-5 w-5" />
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
};

export default CustomerDashboard;
