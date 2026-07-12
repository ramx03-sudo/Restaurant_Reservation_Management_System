import React from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';
import DashboardLayout from '../layouts/DashboardLayout';
import { Users, Calendar, CheckCircle, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminCustomers = () => {
  // 1. Fetch all customer accounts
  const { data: customersResponse, isLoading: isLoadingCustomers } = useQuery({
    queryKey: ['adminCustomersList'],
    queryFn: () => apiClient.get('/admin/customers'),
  });

  // 2. Fetch all reservations to compute guest booking counts
  const { data: reservationsResponse, isLoading: isLoadingReservations } = useQuery({
    queryKey: ['adminAllReservations'],
    queryFn: () => apiClient.get('/admin/reservations'),
  });

  const customers = customersResponse?.data || [];
  const reservations = reservationsResponse?.data || [];

  const getCustomerMetrics = (customerId) => {
    const customerReservations = reservations.filter(
      (r) => r.customerId?._id === customerId || r.customerId === customerId
    );
    const total = customerReservations.length;
    const active = customerReservations.filter((r) => r.status === 'confirmed').length;
    const cancelled = customerReservations.filter((r) => r.status === 'cancelled').length;
    return { total, active, cancelled };
  };

  const isLoading = isLoadingCustomers || isLoadingReservations;

  return (
    <DashboardLayout>
      <div className="space-y-6 text-brand-text">
        <div>
          <h2 className="text-3xl font-bold font-serif tracking-tight font-serif">Customers Registry</h2>
          <p className="text-brand-muted font-medium mt-1">Review guest database, reservation counts, and booking histories.</p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-brand-border overflow-hidden"
        >
          {isLoading ? (
            <div className="p-12 text-center text-brand-muted font-semibold flex flex-col items-center justify-center gap-3">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-500 border-t-transparent"></div>
              <span>Retrieving customers ledger...</span>
            </div>
          ) : customers.length === 0 ? (
            <div className="p-16 text-center space-y-4">
              <Users className="h-10 w-10 text-brand-border mx-auto" />
              <h3 className="text-lg font-bold font-serif">No registered customers</h3>
              <p className="text-brand-muted font-medium max-w-sm mx-auto">Customer details will appear here as guests create accounts and reserve tables.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-brand-bg text-brand-muted text-xs font-bold uppercase tracking-wider border-b border-brand-border">
                    <th className="p-4 pl-6">Guest Profile</th>
                    <th className="p-4">Total Reservations</th>
                    <th className="p-4">Active Confirmed</th>
                    <th className="p-4">Cancelled</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border/40">
                  {customers.map((customer) => {
                    const metrics = getCustomerMetrics(customer.id);
                    return (
                      <tr key={customer.id} className="hover:bg-brand-bg/30 text-sm transition-colors group">
                        <td className="p-4 pl-6 flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold border border-primary-200/50">
                            {customer.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-brand-text">{customer.name}</div>
                            <div className="text-xs text-brand-muted font-medium">{customer.email}</div>
                          </div>
                        </td>
                        <td className="p-4 font-bold text-brand-text">
                          <span className="inline-flex items-center gap-1.5">
                            <Calendar className="h-4 w-4 text-brand-muted" />
                            {metrics.total} times reserved
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="inline-flex items-center gap-1 text-green-700 font-bold bg-green-50 px-2.5 py-1 rounded-full border border-green-200">
                            <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                            {metrics.active} active
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="inline-flex items-center gap-1 text-red-700 font-bold bg-red-50 px-2.5 py-1 rounded-full border border-red-200">
                            <XCircle className="h-3.5 w-3.5 text-red-600" />
                            {metrics.cancelled} cancelled
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default AdminCustomers;
