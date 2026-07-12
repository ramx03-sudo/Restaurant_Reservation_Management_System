import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';
import DashboardLayout from '../layouts/DashboardLayout';
import ConfirmationDialog from '../components/ConfirmationDialog';
import { formatHumanDate, formatHumanTime } from '../utils/dateHelper';
import { toast } from 'react-hot-toast';

const MyReservations = () => {
  const queryClient = useQueryClient();
  const [selectedResId, setSelectedResId] = useState(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  const { data: reservationsResponse, isLoading } = useQuery({
    queryKey: ['myReservations'],
    queryFn: () => apiClient.get('/reservations/my'),
  });

  const cancelMutation = useMutation({
    mutationFn: (id) => apiClient.delete(`/reservations/${id}`),
    onSuccess: (response) => {
      toast.success(response.message || 'Reservation cancelled.');
      queryClient.invalidateQueries({ queryKey: ['myReservations'] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to cancel reservation.');
    }
  });

  const handleCancelClick = (id) => {
    setSelectedResId(id);
    setIsCancelModalOpen(true);
  };

  const handleConfirmCancel = () => {
    if (selectedResId) {
      cancelMutation.mutate(selectedResId);
    }
  };

  const reservations = reservationsResponse?.data || [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold font-serif text-gray-900">My Reservations</h2>
          <p className="text-gray-500 font-medium mt-1">Review and manage your table bookings.</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-orange-100 overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">Loading reservations...</div>
          ) : reservations.length === 0 ? (
            <div className="p-8 text-center text-gray-500">You have no reservations booked.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-orange-50/20 text-gray-500 text-xs font-bold uppercase tracking-wider border-b border-orange-100">
                    <th className="p-4">Table</th>
                    <th className="p-4">Date</th>
                    <th className="p-4">Time Slot</th>
                    <th className="p-4">Guests</th>
                    <th className="p-4">Notes</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-orange-50">
                  {reservations.map((res) => (
                    <tr key={res._id} className="hover:bg-orange-50/10 text-sm">
                      <td className="p-4 font-semibold text-gray-800">
                        {res.tableId?.tableNumber || 'Auto-Allocated'}
                      </td>
                      <td className="p-4 text-gray-600 font-semibold">{formatHumanDate(res.reservationDate)}</td>
                      <td className="p-4 text-gray-600">{formatHumanTime(res.startTime)} - {formatHumanTime(res.endTime)}</td>
                      <td className="p-4 text-gray-600">{res.guestCount} guests</td>
                      <td className="p-4 text-gray-500 max-w-xs truncate" title={res.notes}>
                        {res.notes || '-'}
                      </td>
                      <td className="p-4">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                          res.status === 'confirmed' 
                            ? 'bg-green-50 text-green-700' 
                            : res.status === 'cancelled'
                            ? 'bg-red-50 text-red-700'
                            : 'bg-blue-50 text-blue-700'
                        }`}>
                          {res.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        {res.status === 'confirmed' && (
                          <button
                            onClick={() => handleCancelClick(res._id)}
                            className="text-xs font-bold text-red-600 hover:text-red-800 transition-colors py-1.5 px-3 rounded bg-red-50 hover:bg-red-100"
                          >
                            Cancel
                          </button>
                        )}
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
        message="Are you sure you want to cancel this reservation? The table will be released immediately."
        confirmText="Yes, Cancel"
      />
    </DashboardLayout>
  );
};

export default MyReservations;
