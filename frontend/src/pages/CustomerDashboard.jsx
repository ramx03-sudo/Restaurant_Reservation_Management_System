import React, { useContext } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';
import DashboardLayout from '../layouts/DashboardLayout';
import { AuthContext } from '../context/AuthContext';
import { Calendar, CheckCircle2, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const CustomerDashboard = () => {
  const { user } = useContext(AuthContext);

  const { data: reservationsResponse, isLoading } = useQuery({
    queryKey: ['myReservations'],
    queryFn: () => apiClient.get('/reservations/my'),
  });

  const reservations = reservationsResponse?.data || [];
  
  const activeCount = reservations.filter(r => r.status === 'confirmed').length;
  const cancelledCount = reservations.filter(r => r.status === 'cancelled').length;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div>
          <h2 className="text-3xl font-bold font-serif text-gray-900">Hello, {user?.name}!</h2>
          <p className="text-gray-500 font-medium mt-1">Manage your table bookings and check details here.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-orange-100 flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-orange-100 flex items-center justify-center text-primary-500">
              <Calendar className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-500">Total Bookings</p>
              <h3 className="text-2xl font-bold text-gray-800">{isLoading ? '...' : reservations.length}</h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-orange-100 flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center text-green-600">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-500">Active Bookings</p>
              <h3 className="text-2xl font-bold text-gray-800">{isLoading ? '...' : activeCount}</h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-orange-100 flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-red-100 flex items-center justify-center text-red-600">
              <XCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-500">Cancelled Bookings</p>
              <h3 className="text-2xl font-bold text-gray-800">{isLoading ? '...' : cancelledCount}</h3>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-8 rounded-xl shadow-sm border border-orange-100">
          <h3 className="text-xl font-bold font-serif text-gray-900 mb-2">Need a Table?</h3>
          <p className="text-gray-500 mb-6 font-medium">Book a table in seconds. Our system automatically allocates the most suitable table size for your guests.</p>
          <div className="flex gap-4">
            <Link to="/dashboard/book" className="btn btn-primary">Book a Table</Link>
            <Link to="/dashboard/my-reservations" className="btn btn-outline">View My Reservations</Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CustomerDashboard;
