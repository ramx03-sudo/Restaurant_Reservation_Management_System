import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';
import DashboardLayout from '../layouts/DashboardLayout';
import ConfirmationDialog from '../components/ConfirmationDialog';
import { toast } from 'react-hot-toast';
import { Trash2, XCircle } from 'lucide-react';

const AdminReservations = () => {
  const queryClient = useQueryClient();
  const [filterDate, setFilterDate] = useState('');
  const [selectedResId, setSelectedResId] = useState(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Fetch reservations based on date filter
  const { data: reservationsResponse, isLoading } = useQuery({
    queryKey: ['adminReservations', filterDate],
    queryFn: () => {
      const url = filterDate 
        ? `/admin/reservations/date/${filterDate}`
        : '/admin/reservations';
      return apiClient.get(url);
    },
  });

  // Cancel Mutation (Updates status to cancelled)
  const cancelMutation = useMutation({
    mutationFn: (id) => apiClient.put(`/admin/reservations/${id}`, { status: 'cancelled' }),
    onSuccess: (response) => {
      toast.success(response.message || 'Reservation cancelled.');
      queryClient.invalidateQueries({ queryKey: ['adminReservations'] });
      queryClient.invalidateQueries({ queryKey: ['adminMetrics'] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to cancel reservation.');
    }
  });

  // Permanent Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => apiClient.delete(`/admin/reservations/${id}`),
    onSuccess: (response) => {
      toast.success(response.message || 'Reservation permanently deleted.');
      queryClient.invalidateQueries({ queryKey: ['adminReservations'] });
      queryClient.invalidateQueries({ queryKey: ['adminMetrics'] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete reservation.');
    }
  });

  const handleCancelClick = (id) => {
    setSelectedResId(id);
    setIsCancelModalOpen(true);
  };

  const handleDeleteClick = (id) => {
    setSelectedResId(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmCancel = () => {
    if (selectedResId) {
      cancelMutation.mutate(selectedResId);
    }
  };

  const handleConfirmDelete = () => {
    if (selectedResId) {
      deleteMutation.mutate(selectedResId);
    }
  };

  const reservations = reservationsResponse?.data || [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold font-serif text-gray-900">Manage Reservations</h2>
            <p className="text-gray-500 font-medium mt-1">Oversee, search, and manage all dining bookings.</p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-gray-600">Filter Date:</span>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="px-4 py-2 border border-gray-200 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            />
            {filterDate && (
              <button 
                onClick={() => setFilterDate('')}
                className="text-xs font-bold text-primary-600 hover:text-primary-800 transition-colors py-2 px-3 rounded bg-primary-50"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-orange-100 overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">Loading reservations...</div>
          ) : reservations.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No reservations found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-orange-50/20 text-gray-500 text-xs font-bold uppercase tracking-wider border-b border-orange-100">
                    <th className="p-4">Customer</th>
                    <th className="p-4">Table</th>
                    <th className="p-4">Date</th>
                    <th className="p-4">Time</th>
                    <th className="p-4">Guests</th>
                    <th className="p-4">Notes</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-orange-50">
                  {reservations.map((res) => (
                    <tr key={res._id} className="hover:bg-orange-50/10 text-sm">
                      <td className="p-4">
                        <div className="font-semibold text-gray-800">{res.customerId?.name || 'Deleted User'}</div>
                        <div className="text-xs text-gray-500">{res.customerId?.email}</div>
                      </td>
                      <td className="p-4 font-semibold text-gray-800">
                        {res.tableId?.tableNumber || 'Auto-Allocated'}
                      </td>
                      <td className="p-4 text-gray-600">{res.reservationDate}</td>
                      <td className="p-4 text-gray-600">{res.startTime} - {res.endTime}</td>
                      <td className="p-4 text-gray-600">{res.guestCount}</td>
                      <td className="p-4 text-gray-500 max-w-xs truncate" title={res.notes}>
                        {res.notes || '-'}
                      </td>
                      <td className="p-4">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                          res.status === 'confirmed' 
                            ? 'bg-green-50 text-green-700' 
                            : 'bg-red-50 text-red-700'
                        }`}>
                          {res.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          {res.status === 'confirmed' && (
                            <button
                              onClick={() => handleCancelClick(res._id)}
                              className="text-xs font-bold text-red-600 hover:text-red-800 transition-colors py-1.5 px-3 rounded bg-red-50 hover:bg-red-100 flex items-center gap-1"
                              title="Cancel Reservation"
                            >
                              <XCircle className="h-3.5 w-3.5" />
                              Cancel
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteClick(res._id)}
                            className="text-xs font-bold text-gray-600 hover:text-gray-800 transition-colors py-1.5 px-3 rounded bg-gray-50 hover:bg-gray-100 flex items-center gap-1"
                            title="Permanently Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5 text-gray-500" />
                            Delete
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
      </div>

      <ConfirmationDialog
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={handleConfirmCancel}
        title="Cancel Reservation?"
        message="Are you sure you want to cancel this booking? This will update the status to 'cancelled'."
        confirmText="Yes, Cancel"
      />

      <ConfirmationDialog
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Permanently Delete Reservation?"
        message="Are you sure you want to permanently delete this reservation record from the database?"
        confirmText="Yes, Delete"
      />
    </DashboardLayout>
  );
};

export default AdminReservations;
