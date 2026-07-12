import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';
import DashboardLayout from '../layouts/DashboardLayout';
import { toast } from 'react-hot-toast';
import { Check, X, Users, AlertTriangle, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const tableFormSchema = z.object({
  tableNumber: z.string().min(1, 'Table number is required'),
  capacity: z.preprocess(
    (val) => parseInt(val, 10),
    z.number().int().positive('Capacity must be a positive integer')
  ),
  isActive: z.boolean().optional().default(true),
});

const AdminTables = () => {
  const queryClient = useQueryClient();

  const { data: tablesResponse, isLoading } = useQuery({
    queryKey: ['adminTables'],
    queryFn: () => apiClient.get('/tables'),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(tableFormSchema),
  });

  const createMutation = useMutation({
    mutationFn: (data) => apiClient.post('/tables', data),
    onSuccess: (response) => {
      toast.success(response.message || 'Table created successfully.');
      reset();
      queryClient.invalidateQueries({ queryKey: ['adminTables'] });
      queryClient.invalidateQueries({ queryKey: ['adminMetrics'] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create table.');
    }
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }) => apiClient.put(`/tables/${id}`, { isActive }),
    onSuccess: (response) => {
      toast.success('Table status updated.');
      queryClient.invalidateQueries({ queryKey: ['adminTables'] });
      queryClient.invalidateQueries({ queryKey: ['adminMetrics'] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update table status.');
    }
  });

  const onSubmit = (data) => {
    createMutation.mutate(data);
  };

  const handleToggleActive = (id, currentStatus) => {
    toggleMutation.mutate({ id, isActive: !currentStatus });
  };

  const tables = tablesResponse?.data || [];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35 } }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 text-brand-text">
        <div>
          <h2 className="text-3xl font-bold font-serif tracking-tight">Seating Config</h2>
          <p className="text-brand-muted font-medium mt-1">Configure restaurant tables and toggle active layout structures.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Table Cards Grid */}
          <div className="lg:col-span-2 space-y-4">
            {isLoading ? (
              <div className="p-12 bg-white rounded-xl border border-brand-border text-center text-brand-muted font-semibold flex flex-col items-center justify-center gap-3">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-500 border-t-transparent"></div>
                <span>Retrieving seating chart...</span>
              </div>
            ) : tables.length === 0 ? (
              <div className="p-16 bg-white rounded-xl border border-brand-border text-center space-y-4 shadow-sm">
                <Sparkles className="h-10 w-10 text-brand-border mx-auto" />
                <h3 className="text-lg font-bold font-serif">No tables configured</h3>
                <p className="text-brand-muted font-medium max-w-sm mx-auto">Create a table using the editor panel to establish your dining capacity.</p>
              </div>
            ) : (
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 sm:grid-cols-2 gap-6"
              >
                {tables.map((table) => (
                  <motion.div 
                    key={table._id}
                    variants={cardVariants}
                    whileHover={{ y: -3 }}
                    className={`bg-white p-6 rounded-xl border transition-all shadow-sm flex flex-col justify-between h-40 ${
                      table.isActive ? 'border-brand-border' : 'border-dashed border-brand-border/80 opacity-80'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <h4 className="font-serif font-bold text-lg">{table.tableNumber}</h4>
                        <span className="text-xs text-brand-muted font-semibold flex items-center gap-1">
                          <Users className="h-3.5 w-3.5 text-primary-500" />
                          Capacity: {table.capacity} guests
                        </span>
                      </div>
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        table.isActive 
                          ? 'bg-green-50 border border-green-200 text-green-700' 
                          : 'bg-red-50 border border-red-200 text-red-700'
                      }`}>
                        {table.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    <div className="flex items-center justify-end border-t border-brand-border/40 pt-4 mt-auto">
                      <button
                        onClick={() => handleToggleActive(table._id, table.isActive)}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                          table.isActive 
                            ? 'bg-brand-bg text-brand-text border-brand-border hover:bg-orange-50/15' 
                            : 'bg-primary-50 border-primary-200 text-primary-600 hover:bg-primary-100/50'
                        }`}
                      >
                        {table.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>

          {/* Add Table Editor Card */}
          <div className="bg-white p-6 rounded-xl border border-brand-border shadow-sm">
            <h3 className="text-xl font-bold font-serif text-brand-text mb-4">Add New Table</h3>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-1">Table Label / Number</label>
                <input
                  type="text"
                  {...register('tableNumber')}
                  placeholder="e.g. Table 7"
                  className={`w-full px-4 py-2.5 rounded-lg border bg-brand-bg/50 focus:outline-none focus:ring-2 focus:ring-primary-500/20 text-sm font-semibold ${
                    errors.tableNumber ? 'border-red-300 focus:border-red-500' : 'border-brand-border focus:border-primary-500'
                  }`}
                />
                {errors.tableNumber && (
                  <p className="mt-1 text-xs text-red-600 font-semibold">{errors.tableNumber.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-1">Seating Capacity</label>
                <input
                  type="number"
                  {...register('capacity')}
                  placeholder="4"
                  min="1"
                  className={`w-full px-4 py-2.5 rounded-lg border bg-brand-bg/50 focus:outline-none focus:ring-2 focus:ring-primary-500/20 text-sm font-semibold ${
                    errors.capacity ? 'border-red-300 focus:border-red-500' : 'border-brand-border focus:border-primary-500'
                  }`}
                />
                {errors.capacity && (
                  <p className="mt-1 text-xs text-red-600 font-semibold">{errors.capacity.message}</p>
                )}
              </div>

              <div className="flex items-center gap-2 py-1">
                <input
                  type="checkbox"
                  id="isActive"
                  {...register('isActive')}
                  className="rounded border-brand-border text-primary-500 focus:ring-primary-500 cursor-pointer"
                />
                <label htmlFor="isActive" className="text-xs font-bold uppercase tracking-wider text-brand-muted cursor-pointer select-none">
                  Mark active immediately
                </label>
              </div>

              <button
                type="submit"
                disabled={createMutation.isPending}
                className="w-full py-3.5 px-4 bg-primary-500 text-white rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-primary-600 transition-all shadow-md shadow-primary-500/10 disabled:bg-primary-200 cursor-pointer"
              >
                Create Table
              </button>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminTables;
