import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';
import DashboardLayout from '../layouts/DashboardLayout';
import { toast } from 'react-hot-toast';
import { Loader2, CheckCircle2, AlertTriangle, Calendar, Clock, Users, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';

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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const formItemVariants = {
    hidden: { opacity: 0, x: -15 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } }
  };

  return (
    <DashboardLayout>
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8 max-w-2xl text-brand-text"
      >
        <div>
          <h2 className="text-3xl font-bold font-serif tracking-tight text-brand-text">Book a Table</h2>
          <p className="text-brand-muted font-medium mt-1">Experience elegant culinary hospitality. Tables are dynamically allocated.</p>
        </div>

        <motion.div 
          variants={formItemVariants}
          className="bg-white p-8 rounded-xl shadow-sm border border-brand-border"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Date Input */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-brand-muted flex items-center gap-1.5 mb-1">
                  <Calendar className="h-3.5 w-3.5 text-primary-500" />
                  Date
                </label>
                <input
                  type="date"
                  {...register('reservationDate')}
                  min={new Date().toISOString().split('T')[0]}
                  className={`w-full px-4 py-2.5 rounded-lg border bg-brand-bg/50 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all font-semibold ${
                    errors.reservationDate ? 'border-red-300 focus:border-red-500' : 'border-brand-border focus:border-primary-500'
                  }`}
                />
                {errors.reservationDate && (
                  <p className="mt-1 text-xs text-red-600 font-semibold">{errors.reservationDate.message}</p>
                )}
              </div>

              {/* Time Select */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-brand-muted flex items-center gap-1.5 mb-1">
                  <Clock className="h-3.5 w-3.5 text-primary-500" />
                  Time Slot
                </label>
                <select
                  {...register('startTime')}
                  className={`w-full px-4 py-2.5 rounded-lg border bg-brand-bg/50 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all font-semibold ${
                    errors.startTime ? 'border-red-300 focus:border-red-500' : 'border-brand-border focus:border-primary-500'
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
                {errors.startTime && (
                  <p className="mt-1 text-xs text-red-600 font-semibold">{errors.startTime.message}</p>
                )}
              </div>
            </div>

            {/* Guest Count */}
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-brand-muted flex items-center gap-1.5 mb-1">
                <Users className="h-3.5 w-3.5 text-primary-500" />
                Guests
              </label>
              <input
                type="number"
                {...register('guestCount')}
                min="1"
                max="20"
                placeholder="2"
                className={`w-full px-4 py-2.5 rounded-lg border bg-brand-bg/50 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all font-semibold ${
                  errors.guestCount ? 'border-red-300 focus:border-red-500' : 'border-brand-border focus:border-primary-500'
                }`}
              />
              {errors.guestCount && (
                <p className="mt-1 text-xs text-red-600 font-semibold">{errors.guestCount.message}</p>
              )}
            </div>

            {/* Special Requests */}
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-brand-muted flex items-center gap-1.5 mb-1">
                <MessageSquare className="h-3.5 w-3.5 text-primary-500" />
                Special Notes
              </label>
              <textarea
                {...register('notes')}
                rows="3"
                placeholder="celebrating an anniversary, allergy details, high chair..."
                className="w-full px-4 py-2.5 rounded-lg border border-brand-border bg-brand-bg/50 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 font-medium"
              ></textarea>
            </div>

            {/* Availability Indicator Widget */}
            {(dateVal && timeVal && guestsVal && !errors.reservationDate && !errors.startTime && !errors.guestCount) && (
              <div className="p-4 rounded-lg bg-brand-bg border border-brand-border flex items-center justify-between shadow-inner/5">
                <span className="text-xs text-brand-muted font-bold uppercase tracking-wider">Availability Preview:</span>
                {checkingAvailability ? (
                  <div className="flex items-center gap-1.5 text-xs text-brand-muted font-semibold">
                    <Loader2 className="h-4 w-4 animate-spin text-primary-500" />
                    Checking seating...
                  </div>
                ) : isAvailable ? (
                  <div className="flex items-center gap-1.5 text-xs text-green-700 font-bold bg-green-50 px-3 py-1 rounded-full border border-green-200">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ✓ Table Available ({allocatedTableNumber} Assigned)
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-xs text-red-700 font-bold bg-red-50 px-3 py-1 rounded-full border border-red-200">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    Fully Booked
                  </div>
                )}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={bookMutation.isPending || checkingAvailability || isAvailable === false}
              className="w-full py-3.5 px-4 bg-primary-500 text-white rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-primary-600 transition-all shadow-md shadow-primary-500/10 disabled:bg-primary-200 disabled:shadow-none flex items-center justify-center gap-2 cursor-pointer"
            >
              {bookMutation.isPending ? <Loader2 className="h-4.5 w-4.5 animate-spin" /> : 'Confirm Reservation'}
            </button>
          </form>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
};

export default CreateReservation;
