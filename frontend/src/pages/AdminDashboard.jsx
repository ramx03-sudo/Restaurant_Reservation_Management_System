import React from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';
import DashboardLayout from '../layouts/DashboardLayout';
import { formatHumanDate, formatHumanTime } from '../utils/dateHelper';
import { Calendar, CheckCircle2, XCircle, TableProperties, Percent, Users, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const { data: metricsResponse, isLoading } = useQuery({
    queryKey: ['adminMetrics'],
    queryFn: () => apiClient.get('/admin/metrics'),
  });

  const metrics = metricsResponse?.data || {
    totalReservations: 0,
    activeReservations: 0,
    cancelledReservations: 0,
    totalTables: 0,
    occupancyPercentage: 0,
    todayCount: 0,
    nextReservation: null
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold font-serif text-gray-900">Admin Dashboard</h2>
          <p className="text-gray-500 font-medium mt-1">Real-time metrics, reservations management, and table layouts.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-orange-100 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-gray-500">Today's Bookings</span>
              <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center text-primary-500">
                <Calendar className="h-5 w-5" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-800">{isLoading ? '...' : metrics.todayCount}</h3>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-orange-100 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-gray-500">Active Bookings</span>
              <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center text-green-600">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-800">{isLoading ? '...' : metrics.activeReservations}</h3>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-orange-100 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-gray-500">Cancelled Bookings</span>
              <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center text-red-600">
                <XCircle className="h-5 w-5" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-800">{isLoading ? '...' : metrics.cancelledReservations}</h3>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-orange-100 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-gray-500">Total Tables</span>
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                <TableProperties className="h-5 w-5" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-800">{isLoading ? '...' : metrics.totalTables}</h3>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-orange-100 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-gray-500">Occupancy Rate</span>
              <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600 font-bold">
                <Percent className="h-5 w-5" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-800" title="Today's occupied active seats / active tables total capacity">
              {isLoading ? '...' : `${metrics.occupancyPercentage}%`}
            </h3>
          </div>
        </div>

        {/* Operational Grid: Next Reservation Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-orange-100 overflow-hidden">
            <div className="p-5 bg-gradient-to-r from-orange-400 to-primary-500 text-white flex items-center gap-2">
              <Award className="h-5 w-5" />
              <h3 className="font-serif font-bold text-lg">Next Upcoming Reservation</h3>
            </div>
            <div className="p-6">
              {isLoading ? (
                <div className="py-8 text-center text-gray-500">Loading next reservation...</div>
              ) : metrics.nextReservation ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div className="p-3 bg-orange-50/20 border border-orange-50 rounded-lg">
                    <div className="text-xs text-gray-400 font-bold uppercase mb-1">Time</div>
                    <div className="text-sm font-bold text-gray-800">
                      {formatHumanTime(metrics.nextReservation.time.split(' at ')[1])}
                    </div>
                  </div>
                  <div className="p-3 bg-orange-50/20 border border-orange-50 rounded-lg">
                    <div className="text-xs text-gray-400 font-bold uppercase mb-1">Date</div>
                    <div className="text-sm font-bold text-gray-800">
                      {formatHumanDate(metrics.nextReservation.time.split(' at ')[0])}
                    </div>
                  </div>
                  <div className="p-3 bg-orange-50/20 border border-orange-50 rounded-lg">
                    <div className="text-xs text-gray-400 font-bold uppercase mb-1">Table</div>
                    <div className="text-sm font-bold text-gray-800">{metrics.nextReservation.table}</div>
                  </div>
                  <div className="p-3 bg-orange-50/20 border border-orange-50 rounded-lg">
                    <div className="text-xs text-gray-400 font-bold uppercase mb-1">Customer</div>
                    <div className="text-sm font-bold text-gray-800 truncate" title={metrics.nextReservation.customer}>
                      {metrics.nextReservation.customer}
                    </div>
                  </div>
                  <div className="col-span-2 md:col-span-4 p-3 bg-gray-50 rounded-lg text-xs font-semibold text-gray-600 flex items-center justify-center gap-1">
                    <Users className="h-4 w-4 text-primary-500" />
                    Booking contains {metrics.nextReservation.guests} guests.
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400 font-medium">No upcoming active reservations.</div>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-orange-100 flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold font-serif text-gray-900 mb-2">Operational Controls</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                As an administrator, you have access to full guest reservation histories, dynamic date filters, and seating configuration tables.
              </p>
            </div>
            <div className="space-y-2 mt-6">
              <Link to="/admin/reservations" className="btn btn-primary w-full text-center py-2.5">
                Manage Reservations
              </Link>
              <Link to="/admin/tables" className="btn btn-outline w-full text-center py-2.5">
                Seating Config
              </Link>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
