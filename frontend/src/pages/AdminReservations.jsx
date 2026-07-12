import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';
import DashboardLayout from '../layouts/DashboardLayout';
import ConfirmationDialog from '../components/ConfirmationDialog';
import { formatHumanDate, formatHumanTime } from '../utils/dateHelper';
import { toast } from 'react-hot-toast';
import { XCircle, Edit, Calendar, PlusCircle, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

const editReservationSchema = z.object({
  reservationDate: z.string().regex(dateRegex, 'Invalid date format (YYYY-MM-DD)'),
  startTime: z.string().regex(timeRegex, 'Please select a start time'),
  guestCount: z.preprocess(
    (val) => parseInt(val, 10),
    z.number().int().positive('Guest count must be a positive integer')
  ),
  notes: z.string().optional(),
});

const adminCreateReservationSchema = z.object({
  customerId: z.string().min(1, 'Please select a customer'),
  reservationDate: z.string().regex(dateRegex, 'Invalid date format'),
  startTime: z.string().regex(timeRegex, 'Please select a start time'),
  guestCount: z.preprocess(
    (val) => parseInt(val, 10),
    z.number().int().positive('Guest count must be a positive integer')
  ),
  notes: z.string().optional(),
});

const AdminReservations = () => {
  const queryClient = useQueryClient();
  const [filterDate, setFilterDate] = useState('');
  const [selectedRes, setSelectedRes] = useState(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

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

  // Fetch registered customers for the create reservation selector
  const { data: customersResponse } = useQuery({
    queryKey: ['adminCustomers'],
    queryFn: () => apiClient.get('/admin/customers'),
    enabled: isCreateModalOpen,
  });

  const customers = customersResponse?.data || [];

  // Edit Form FormState
  const {
    register: registerEdit,
    handleSubmit: handleEditSubmit,
    setValue: setEditValue,
    formState: { errors: editErrors },
  } = useForm({
    resolver: zodResolver(editReservationSchema),
  });

  // Create Form FormState
  const {
    register: registerCreate,
    handleSubmit: handleCreateSubmit,
    watch: watchCreate,
    reset: resetCreate,
    formState: { errors: createErrors },
  } = useForm({
    resolver: zodResolver(adminCreateReservationSchema),
    defaultValues: {
      guestCount: 2,
    }
  });

  const dateVal = watchCreate('reservationDate');
  const timeVal = watchCreate('startTime');
  const guestsVal = watchCreate('guestCount');

  // Query to check table availability in real-time inside Create Modal
  const { data: availabilityResponse, isFetching: checkingAvailability } = useQuery({
    queryKey: ['availability', dateVal, timeVal, guestsVal],
    queryFn: () => apiClient.get(`/reservations/availability?reservationDate=${dateVal}&startTime=${timeVal}&guestCount=${guestsVal}`),
    enabled: !!(dateVal && timeVal && guestsVal && !createErrors.reservationDate && !createErrors.startTime && !createErrors.guestCount),
    retry: false,
    staleTime: 5000,
  });

  const isAvailable = availabilityResponse?.data?.available;
  const allocatedTableNumber = availabilityResponse?.data?.table;

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

  // Edit details Mutation
  const editMutation = useMutation({
    mutationFn: ({ id, data }) => apiClient.put(`/admin/reservations/${id}/details`, data),
    onSuccess: (response) => {
      toast.success(response.message || 'Reservation updated successfully.');
      setIsEditModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['adminReservations'] });
      queryClient.invalidateQueries({ queryKey: ['adminMetrics'] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update reservation.');
    }
  });

  // Create on-behalf-of Mutation
  const createMutation = useMutation({
    mutationFn: (data) => apiClient.post('/reservations', data),
    onSuccess: (response) => {
      toast.success(response.message || 'Table booked successfully!');
      setIsCreateModalOpen(false);
      resetCreate();
      queryClient.invalidateQueries({ queryKey: ['adminReservations'] });
      queryClient.invalidateQueries({ queryKey: ['adminMetrics'] });
    },
    onError: (error) => {
      toast.error(error.message || 'Booking failed. No table available.');
    }
  });

  const handleCancelClick = (res) => {
    setSelectedRes(res);
    setIsCancelModalOpen(true);
  };

  const handleEditClick = (res) => {
    setSelectedRes(res);
    setEditValue('reservationDate', res.reservationDate);
    setEditValue('startTime', res.startTime);
    setEditValue('guestCount', res.guestCount);
    setEditValue('notes', res.notes || '');
    setIsEditModalOpen(true);
  };

  const handleConfirmCancel = () => {
    if (selectedRes) {
      cancelMutation.mutate(selectedRes._id);
    }
  };

  const onEditSubmit = (data) => {
    if (selectedRes) {
      editMutation.mutate({ id: selectedRes._id, data });
    }
  };

  const onCreateSubmit = (data) => {
    createMutation.mutate(data);
  };

  const reservations = reservationsResponse?.data || [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold font-serif text-gray-900">Manage Reservations</h2>
            <p className="text-gray-500 font-medium mt-1">Oversee, edit, and create dining bookings.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="btn btn-primary px-4 py-2 text-sm flex items-center gap-1.5"
            >
              <PlusCircle className="h-4.5 w-4.5" />
              New Booking
            </button>

            <div className="flex items-center gap-2">
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
                            : 'bg-red-50 text-red-700'
                        }`}>
                          {res.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          {res.status === 'confirmed' && (
                            <>
                              <button
                                onClick={() => handleEditClick(res)}
                                className="text-xs font-bold text-primary-600 hover:text-primary-800 transition-colors py-1.5 px-3 rounded bg-primary-50 hover:bg-primary-100 flex items-center gap-1"
                                title="Edit Reservation"
                              >
                                <Edit className="h-3.5 w-3.5" />
                                Edit
                              </button>
                              <button
                                onClick={() => handleCancelClick(res)}
                                className="text-xs font-bold text-red-600 hover:text-red-800 transition-colors py-1.5 px-3 rounded bg-red-50 hover:bg-red-100 flex items-center gap-1"
                                title="Cancel Reservation"
                              >
                                <XCircle className="h-3.5 w-3.5" />
                                Cancel
                              </button>
                            </>
                          )}
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

      {/* Cancel Modal */}
      <ConfirmationDialog
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={handleConfirmCancel}
        title="Cancel Reservation?"
        message="Are you sure you want to cancel this booking? This will release the table."
        confirmText="Yes, Cancel"
      />

      {/* Edit Details Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4 text-center">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setIsEditModalOpen(false)}></div>

            <div className="relative transform overflow-hidden rounded-lg bg-white p-6 text-left shadow-xl transition-all w-full max-w-md">
              <h3 className="text-lg font-bold font-serif leading-6 text-gray-900 mb-4 flex items-center gap-2">
                <Edit className="h-5 w-5 text-primary-500" />
                Edit Reservation Details
              </h3>
              
              <form onSubmit={handleEditSubmit(onEditSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Reservation Date</label>
                  <input
                    type="date"
                    {...registerEdit('reservationDate')}
                    className={`w-full px-4 py-2 rounded-lg border bg-orange-50/10 focus:outline-none focus:ring-2 focus:ring-primary-500/20 ${
                      editErrors.reservationDate ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-primary-500'
                    }`}
                  />
                  {editErrors.reservationDate && (
                    <p className="mt-1 text-xs text-red-600 font-semibold">{editErrors.reservationDate.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Start Time</label>
                  <select
                    {...registerEdit('startTime')}
                    className={`w-full px-4 py-2 rounded-lg border bg-orange-50/10 focus:outline-none focus:ring-2 focus:ring-primary-500/20 ${
                      editErrors.startTime ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-primary-500'
                    }`}
                  >
                    <option value="12:00">12:00 PM</option>
                    <option value="13:00">1:00 PM</option>
                    <option value="14:00">2:00 PM</option>
                    <option value="17:00">5:00 PM</option>
                    <option value="18:00">6:00 PM</option>
                    <option value="19:00">7:00 PM</option>
                    <option value="20:00">8:00 PM</option>
                    <option value="21:00">9:00 PM</option>
                  </select>
                  {editErrors.startTime && (
                    <p className="mt-1 text-xs text-red-600 font-semibold">{editErrors.startTime.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Guests Count</label>
                  <input
                    type="number"
                    {...registerEdit('guestCount')}
                    min="1"
                    className={`w-full px-4 py-2 rounded-lg border bg-orange-50/10 focus:outline-none focus:ring-2 focus:ring-primary-500/20 ${
                      editErrors.guestCount ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-primary-500'
                    }`}
                  />
                  {editErrors.guestCount && (
                    <p className="mt-1 text-xs text-red-600 font-semibold">{editErrors.guestCount.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Notes</label>
                  <textarea
                    {...registerEdit('notes')}
                    rows="2"
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 bg-orange-50/10 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  ></textarea>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    onClick={() => setIsEditModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={editMutation.isPending}
                    className="inline-flex justify-center rounded-md border border-transparent bg-primary-500 hover:bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-md disabled:bg-primary-300"
                  >
                    {editMutation.isPending ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Create Reservation Modal (Walk-in / Phone bookings on-behalf-of Customer) */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4 text-center">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setIsCreateModalOpen(false)}></div>

            <div className="relative transform overflow-hidden rounded-lg bg-white p-6 text-left shadow-xl transition-all w-full max-w-md">
              <h3 className="text-lg font-bold font-serif leading-6 text-gray-900 mb-4 flex items-center gap-2">
                <PlusCircle className="h-5 w-5 text-primary-500" />
                Book Table (On behalf of Customer)
              </h3>
              
              <form onSubmit={handleCreateSubmit(onCreateSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Select Customer</label>
                  <select
                    {...registerCreate('customerId')}
                    className={`w-full px-4 py-2 rounded-lg border bg-orange-50/10 focus:outline-none focus:ring-2 focus:ring-primary-500/20 ${
                      createErrors.customerId ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-primary-500'
                    }`}
                  >
                    <option value="">-- Choose Customer --</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.email})
                      </option>
                    ))}
                  </select>
                  {createErrors.customerId && (
                    <p className="mt-1 text-xs text-red-600 font-semibold">{createErrors.customerId.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Reservation Date</label>
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    {...registerCreate('reservationDate')}
                    className={`w-full px-4 py-2 rounded-lg border bg-orange-50/10 focus:outline-none focus:ring-2 focus:ring-primary-500/20 ${
                      createErrors.reservationDate ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-primary-500'
                    }`}
                  />
                  {createErrors.reservationDate && (
                    <p className="mt-1 text-xs text-red-600 font-semibold">{createErrors.reservationDate.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Start Time</label>
                  <select
                    {...registerCreate('startTime')}
                    className={`w-full px-4 py-2 rounded-lg border bg-orange-50/10 focus:outline-none focus:ring-2 focus:ring-primary-500/20 ${
                      createErrors.startTime ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-primary-500'
                    }`}
                  >
                    <option value="">-- Choose Time --</option>
                    <option value="12:00">12:00 PM</option>
                    <option value="13:00">1:00 PM</option>
                    <option value="14:00">2:00 PM</option>
                    <option value="17:00">5:00 PM</option>
                    <option value="18:00">6:00 PM</option>
                    <option value="19:00">7:00 PM</option>
                    <option value="20:00">8:00 PM</option>
                    <option value="21:00">9:00 PM</option>
                  </select>
                  {createErrors.startTime && (
                    <p className="mt-1 text-xs text-red-600 font-semibold">{createErrors.startTime.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Guests Count</label>
                  <input
                    type="number"
                    min="1"
                    {...registerCreate('guestCount')}
                    className={`w-full px-4 py-2 rounded-lg border bg-orange-50/10 focus:outline-none focus:ring-2 focus:ring-primary-500/20 ${
                      createErrors.guestCount ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-primary-500'
                    }`}
                  />
                  {createErrors.guestCount && (
                    <p className="mt-1 text-xs text-red-600 font-semibold">{createErrors.guestCount.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Notes</label>
                  <textarea
                    {...registerCreate('notes')}
                    rows="2"
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 bg-orange-50/10 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  ></textarea>
                </div>

                {/* Real-time availability indicator widget */}
                {(dateVal && timeVal && guestsVal && !createErrors.reservationDate && !createErrors.startTime && !createErrors.guestCount) && (
                  <div className="p-3.5 rounded-lg bg-orange-50/30 border border-orange-100 flex items-center justify-between">
                    <span className="text-xs text-gray-600 font-medium">Availability Status:</span>
                    {checkingAvailability ? (
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 font-semibold">
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-primary-500" />
                        Checking...
                      </div>
                    ) : isAvailable ? (
                      <div className="flex items-center gap-1 text-xs text-green-700 font-bold bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                        Available ({allocatedTableNumber})
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-xs text-red-700 font-bold bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                        <AlertTriangle className="h-3.5 w-3.5 text-red-600" />
                        Fully Booked
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    onClick={() => setIsCreateModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createMutation.isPending || checkingAvailability || isAvailable === false}
                    className="inline-flex justify-center rounded-md border border-transparent bg-primary-500 hover:bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-md disabled:bg-primary-300"
                  >
                    {createMutation.isPending ? 'Booking...' : 'Book Table'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminReservations;
