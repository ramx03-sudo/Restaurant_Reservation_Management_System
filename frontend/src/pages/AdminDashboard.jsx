import React from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';
import DashboardLayout from '../layouts/DashboardLayout';
import { Calendar, CheckCircle2, XCircle, TableProperties, Percent } from 'lucide-react';
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
    occupancyPercentage: 0
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold font-serif text-gray-900">Admin Dashboard</h2>
          <p className="text-gray-500 font-medium mt-1">Real-time metrics, reservations management, and table layout control.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-orange-100 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-gray-500">Total Bookings</span>
              <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center text-primary-500">
                <Calendar className="h-5 w-5" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-800">{isLoading ? '...' : metrics.totalReservations}</h3>
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
              <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600">
                <Percent className="h-5 w-5" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-800">{isLoading ? '...' : `${metrics.occupancyPercentage}%`}</h3>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-8 rounded-xl shadow-sm border border-orange-100">
            <h3 className="text-xl font-bold font-serif text-gray-900 mb-2">Reservation Logs</h3>
            <p className="text-gray-500 mb-6 font-medium">Review customer reservations, apply filters by date, and perform check-ins or cancellations.</p>
            <Link to="/admin/reservations" className="btn btn-primary">Manage Reservations</Link>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-sm border border-orange-100">
            <h3 className="text-xl font-bold font-serif text-gray-900 mb-2">Seating Configuration</h3>
            <p className="text-gray-500 mb-6 font-medium">Manage tables, edit table numbers, configure seating capacity limits, or temporarily set active/inactive tables.</p>
            <Link to="/admin/tables" className="btn btn-outline">Configure Tables</Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
