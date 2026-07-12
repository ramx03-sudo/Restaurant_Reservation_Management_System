import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';
import DashboardLayout from '../layouts/DashboardLayout';
import ConfirmationDialog from '../components/ConfirmationDialog';
import { formatHumanDate, formatHumanTime } from '../utils/dateHelper';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Calendar, AlertCircle } from 'lucide-react';

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
      <div className="space-y-6 text-brand-text">
        <div>
          <h2 className="text-3xl font-bold font-serif tracking-tight">My Reservations</h2>
          <p className="text-brand-muted font-medium mt-1">Review and manage your table bookings at Lumina Dining.</p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-brand-border overflow-hidden"
        >
          {isLoading ? (
            <div className="p-12 text-center text-brand-muted font-semibold flex flex-col items-center justify-center gap-3">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-500 border-t-transparent"></div>
              <span>Retrieving reservation logs...</span>
            </div>
          ) : reservations.length === 0 ? (
            <div className="p-16 text-center space-y-4">
              <Calendar className="h-10 w-10 text-brand-border mx-auto" />
              <h3 className="text-lg font-bold font-serif">No reservations yet</h3>
              <p className="text-brand-muted font-medium max-w-sm mx-auto">Book your first table reservation to experience Lumina's curated dining.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-brand-bg text-brand-muted text-xs font-bold uppercase tracking-wider border-b border-brand-border">
                    <th className="p-4 pl-6">Table</th>
                    <th className="p-4">Date</th>
                    <th className="p-4">Time Slot</th>
                    <th className="p-4">Guests</th>
                    <th className="p-4">Special Notes</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 pr-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border/40">
                  {reservations.map((res) => (
                    <tr key={res._id} className="hover:bg-brand-bg/30 text-sm transition-colors group">
                      <td className="p-4 pl-6 font-bold text-brand-text">
                        {res.tableId?.tableNumber || 'Table Assigned'}
                      </td>
                      <td className="p-4 text-brand-muted font-semibold group-hover:text-brand-text transition-colors">
                        {formatHumanDate(res.reservationDate)}
                      </td>
                      <td className="p-4 text-brand-muted group-hover:text-brand-text transition-colors">
                        {formatHumanTime(res.startTime)} - {formatHumanTime(res.endTime)}
                      </td>
                      <td className="p-4 text-brand-muted group-hover:text-brand-text transition-colors">
                        {res.guestCount} guests
                      </td>
                      <td className="p-4 text-brand-muted max-w-xs truncate" title={res.notes}>
                        {res.notes || '-'}
                      </td>
                      <td className="p-4">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${
                          res.status === 'confirmed' 
                            ? 'bg-green-50 border border-green-200 text-green-700' 
                            : res.status === 'cancelled'
                            ? 'bg-red-50 border border-red-200 text-red-700'
                            : 'bg-blue-50 border border-blue-200 text-blue-700'
                        }`}>
                          {res.status}
                        </span>
                      </td>
                      <td className="p-4 pr-6 text-right">
                        {res.status === 'confirmed' && (
                          <button
                            onClick={() => handleCancelClick(res._id)}
                            className="text-xs font-bold text-red-600 hover:text-red-800 transition-colors py-1.5 px-3 rounded bg-red-50 hover:bg-red-100/60 border border-red-200/20 cursor-pointer"
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
        </motion.div>
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
