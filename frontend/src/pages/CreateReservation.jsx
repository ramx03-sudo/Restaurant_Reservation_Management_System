import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';
import DashboardLayout from '../layouts/DashboardLayout';
import { toast } from 'react-hot-toast';
import { Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

const reservationFormSchema = z.object({
  reservationDate: z.string().regex(dateRegex, 'Invalid date format'),
  startTime: z.string().regex(timeRegex, 'Please select a start time'),
  guestCount: z.preprocess(
    (val) => parseInt(val, 10),
    z.number().int().positive('Guest count must be a positive integer')
  ),
  notes: z.string().optional(),
});

const CreateReservation = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(reservationFormSchema),
    defaultValues: {
      guestCount: 2,
    }
  });

  const dateVal = watch('reservationDate');
  const timeVal = watch('startTime');
  const guestsVal = watch('guestCount');

  // Query to check table availability in real-time
  const { data: availabilityResponse, isFetching: checkingAvailability } = useQuery({
    queryKey: ['availability', dateVal, timeVal, guestsVal],
    queryFn: () => apiClient.get(`/reservations/availability?reservationDate=${dateVal}&startTime=${timeVal}&guestCount=${guestsVal}`),
    enabled: !!(dateVal && timeVal && guestsVal && !errors.reservationDate && !errors.startTime && !errors.guestCount),
    retry: false,
    staleTime: 5000,
  });

  const isAvailable = availabilityResponse?.data?.available;
  const allocatedTableNumber = availabilityResponse?.data?.table;

  const bookMutation = useMutation({
    mutationFn: (data) => apiClient.post('/reservations', data),
    onSuccess: (response) => {
      toast.success(response.message || 'Table booked successfully!');
      navigate('/dashboard/my-reservations');
    },
    onError: (error) => {
      toast.error(error.message || 'Booking failed. Try another time or guest count.');
    }
  });

  const onSubmit = (data) => {
    bookMutation.mutate(data);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold font-serif text-gray-900">Book a Table</h2>
          <p className="text-gray-500 font-medium mt-1">Our system automatically assigns the smallest available table that fits your party.</p>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-sm border border-orange-100 max-w-2xl">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Reservation Date</label>
                <input
                  type="date"
                  {...register('reservationDate')}
                  min={new Date().toISOString().split('T')[0]}
                  className={`w-full px-4 py-2.5 rounded-lg border bg-orange-50/10 focus:outline-none focus:ring-2 focus:ring-primary-500/20 ${
                    errors.reservationDate ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-primary-500'
                  }`}
                />
                {errors.reservationDate && (
                  <p className="mt-1 text-xs text-red-600 font-semibold">{errors.reservationDate.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Start Time</label>
                <select
                  {...register('startTime')}
                  className={`w-full px-4 py-2.5 rounded-lg border bg-orange-50/10 focus:outline-none focus:ring-2 focus:ring-primary-500/20 ${
                    errors.startTime ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-primary-500'
                  }`}
                >
                  <option value="">-- Select Time --</option>
                  <option value="12:00">12:00 PM</option>
                  <option value="13:00">1:00 PM</option>
                  <option value="14:00">2:00 PM</option>
                  <option value="17:00">5:00 PM</option>
                  <option value="18:00">6:00 PM</option>
                  <option value="19:00">7:00 PM</option>
                  <option value="20:00">8:00 PM</option>
                  <option value="21:00">9:00 PM</option>
                </select>
                {errors.startTime && (
                  <p className="mt-1 text-xs text-red-600 font-semibold">{errors.startTime.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Number of Guests</label>
              <input
                type="number"
                {...register('guestCount')}
                min="1"
                max="20"
                placeholder="2"
                className={`w-full px-4 py-2.5 rounded-lg border bg-orange-50/10 focus:outline-none focus:ring-2 focus:ring-primary-500/20 ${
                  errors.guestCount ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-primary-500'
                }`}
              />
              {errors.guestCount && (
                <p className="mt-1 text-xs text-red-600 font-semibold">{errors.guestCount.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Special Notes / Requests</label>
              <textarea
                {...register('notes')}
                rows="3"
                placeholder="e.g. Window seat, celebrating a birthday, high chair needed"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-orange-50/10 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              ></textarea>
            </div>

            {/* Availability Indicator Widget */}
            {(dateVal && timeVal && guestsVal && !errors.reservationDate && !errors.startTime && !errors.guestCount) && (
              <div className="p-4 rounded-lg bg-orange-50/30 border border-orange-100 flex items-center justify-between">
                <span className="text-sm text-gray-600 font-medium">Availability Status:</span>
                {checkingAvailability ? (
                  <div className="flex items-center gap-1.5 text-sm text-gray-500 font-semibold">
                    <Loader2 className="h-4 w-4 animate-spin text-primary-500" />
                    Checking...
                  </div>
                ) : isAvailable ? (
                  <div className="flex items-center gap-1.5 text-sm text-green-700 font-bold bg-green-50 px-3 py-1 rounded-full border border-green-200">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    Table Available ({allocatedTableNumber})
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-sm text-red-700 font-bold bg-red-50 px-3 py-1 rounded-full border border-red-200">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    Fully Booked
                  </div>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={bookMutation.isPending || checkingAvailability || isAvailable === false}
              className="w-full py-3 px-4 bg-primary-500 text-white rounded-lg font-bold text-sm hover:bg-primary-600 transition-colors shadow-md shadow-primary-500/10 disabled:bg-primary-300 disabled:shadow-none flex items-center justify-center gap-2"
            >
              {bookMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirm Booking'}
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CreateReservation;
