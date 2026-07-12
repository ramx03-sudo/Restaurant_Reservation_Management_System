import React, { useContext } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';
import DashboardLayout from '../layouts/DashboardLayout';
import { AuthContext } from '../context/AuthContext';
import { formatHumanDate, formatHumanTime } from '../utils/dateHelper';
import { Calendar, PlusCircle, Sparkles, Utensils } from 'lucide-react';
import { Link } from 'react-router-dom';

const CustomerDashboard = () => {
  const { user } = useContext(AuthContext);

  const { data: reservationsResponse, isLoading } = useQuery({
    queryKey: ['myReservations'],
    queryFn: () => apiClient.get('/reservations/my'),
  });

  const reservations = reservationsResponse?.data || [];
  
  // Find the next upcoming confirmed reservation (date >= today)
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

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div>
          <h2 className="text-3xl font-bold font-serif text-gray-900">Hello, {user?.name}!</h2>
          <p className="text-gray-500 font-medium mt-1">Ready for a premium dining experience?</p>
        </div>

        {/* Your Next Reservation Card */}
        <div className="bg-white rounded-xl shadow-sm border border-orange-100 overflow-hidden">
          <div className="p-6 bg-gradient-to-r from-primary-500 to-orange-400 text-white flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Sparkles className="h-6 w-6" />
              <h3 className="text-xl font-bold font-serif">Your Next Reservation</h3>
            </div>
            <Link 
              to="/dashboard/book" 
              className="flex items-center gap-1.5 text-xs font-bold bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-lg border border-white/10 transition-colors"
            >
              <PlusCircle className="h-4 w-4" />
              New Booking
            </Link>
          </div>

          <div className="p-8">
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-500 border-t-transparent"></div>
              </div>
            ) : nextReservation ? (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
                <div className="bg-orange-50/40 p-4 rounded-lg border border-orange-100/50 flex flex-col justify-center text-center">
                  <span className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Date</span>
                  <span className="text-lg font-bold text-gray-800">{formatHumanDate(nextReservation.reservationDate)}</span>
                </div>
                
                <div className="bg-orange-50/40 p-4 rounded-lg border border-orange-100/50 flex flex-col justify-center text-center">
                  <span className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Time</span>
                  <span className="text-lg font-bold text-gray-800">{formatHumanTime(nextReservation.startTime)}</span>
                </div>

                <div className="bg-orange-50/40 p-4 rounded-lg border border-orange-100/50 flex flex-col justify-center text-center">
                  <span className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Guests</span>
                  <span className="text-lg font-bold text-gray-800">{nextReservation.guestCount} People</span>
                </div>

                <div className="bg-orange-50/40 p-4 rounded-lg border border-orange-100/50 flex flex-col justify-center text-center">
                  <span className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Table</span>
                  <span className="text-lg font-bold text-gray-800">{nextReservation.tableId?.tableNumber}</span>
                </div>

                {nextReservation.notes && (
                  <div className="md:col-span-4 mt-2 p-3 bg-gray-50 rounded-lg text-sm text-gray-600 border border-gray-100">
                    <span className="font-semibold text-gray-700">Special Notes:</span> {nextReservation.notes}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6">
                <Utensils className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium mb-4">No upcoming bookings. Reserve a table tonight!</p>
                <Link to="/dashboard/book" className="btn btn-primary px-6 py-2.5">
                  Book a Table Now
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Quick History Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-orange-100">
          <h3 className="text-xl font-bold font-serif text-gray-900 mb-4">Quick Stats</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 rounded-lg bg-orange-50/20 border border-orange-100 flex justify-between items-center">
              <span className="text-sm font-semibold text-gray-500">Total Bookings</span>
              <span className="text-xl font-bold text-gray-800">{isLoading ? '...' : reservations.length}</span>
            </div>
            
            <div className="p-4 rounded-lg bg-orange-50/20 border border-orange-100 flex justify-between items-center">
              <span className="text-sm font-semibold text-gray-500">Active Confirmed</span>
              <span className="text-xl font-bold text-green-700">
                {isLoading ? '...' : reservations.filter(r => r.status === 'confirmed').length}
              </span>
            </div>

            <div className="p-4 rounded-lg bg-orange-50/20 border border-orange-100 flex justify-between items-center">
              <span className="text-sm font-semibold text-gray-500">Cancelled / Finished</span>
              <span className="text-xl font-bold text-red-600">
                {isLoading ? '...' : reservations.filter(r => r.status !== 'confirmed').length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CustomerDashboard;
