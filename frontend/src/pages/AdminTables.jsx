import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';
import DashboardLayout from '../layouts/DashboardLayout';
import ConfirmationDialog from '../components/ConfirmationDialog';
import { toast } from 'react-hot-toast';
import { Trash2, Check, X } from 'lucide-react';

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
  const [selectedTableId, setSelectedTableId] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

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
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update table status.');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => apiClient.delete(`/tables/${id}`),
    onSuccess: (response) => {
      toast.success(response.message || 'Table deleted successfully.');
      queryClient.invalidateQueries({ queryKey: ['adminTables'] });
      queryClient.invalidateQueries({ queryKey: ['adminMetrics'] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete table.');
    }
  });

  const onSubmit = (data) => {
    createMutation.mutate(data);
  };

  const handleToggleActive = (id, currentStatus) => {
    toggleMutation.mutate({ id, isActive: !currentStatus });
  };

  const handleDeleteClick = (id) => {
    setSelectedTableId(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedTableId) {
      deleteMutation.mutate(selectedTableId);
    }
  };

  const tables = tablesResponse?.data || [];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold font-serif text-gray-900">Configure Seating Layout</h2>
          <p className="text-gray-500 font-medium mt-1">Configure restaurant tables and toggle their availability.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Table List */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-orange-100 overflow-hidden">
            {isLoading ? (
              <div className="p-8 text-center text-gray-500">Loading tables layout...</div>
            ) : tables.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No tables configured yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-orange-50/20 text-gray-500 text-xs font-bold uppercase tracking-wider border-b border-orange-100">
                      <th className="p-4">Table Number</th>
                      <th className="p-4">Capacity</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-orange-50">
                    {tables.map((table) => (
                      <tr key={table._id} className="hover:bg-orange-50/10 text-sm">
                        <td className="p-4 font-semibold text-gray-800">{table.tableNumber}</td>
                        <td className="p-4 text-gray-600">{table.capacity} guests</td>
                        <td className="p-4">
                          <button
                            onClick={() => handleToggleActive(table._id, table.isActive)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                              table.isActive 
                                ? 'bg-green-50 text-green-700 hover:bg-green-100' 
                                : 'bg-red-50 text-red-700 hover:bg-red-100'
                            }`}
                          >
                            {table.isActive ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                            {table.isActive ? 'Active' : 'Inactive'}
                          </button>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => handleDeleteClick(table._id)}
                            className="text-xs font-bold text-red-600 hover:text-red-800 transition-colors py-1.5 px-3 rounded bg-red-50 hover:bg-red-100 flex items-center gap-1 inline-flex"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Add Table Form */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-orange-100">
            <h3 className="text-xl font-bold font-serif text-gray-900 mb-4">Add New Table</h3>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Table Label / Number</label>
                <input
                  type="text"
                  {...register('tableNumber')}
                  placeholder="e.g. Table 7"
                  className={`w-full px-4 py-2.5 rounded-lg border bg-orange-50/10 focus:outline-none focus:ring-2 focus:ring-primary-500/20 ${
                    errors.tableNumber ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-primary-500'
                  }`}
                />
                {errors.tableNumber && (
                  <p className="mt-1 text-xs text-red-600 font-semibold">{errors.tableNumber.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Seating Capacity</label>
                <input
                  type="number"
                  {...register('capacity')}
                  placeholder="4"
                  min="1"
                  className={`w-full px-4 py-2.5 rounded-lg border bg-orange-50/10 focus:outline-none focus:ring-2 focus:ring-primary-500/20 ${
                    errors.capacity ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-primary-500'
                  }`}
                />
                {errors.capacity && (
                  <p className="mt-1 text-xs text-red-600 font-semibold">{errors.capacity.message}</p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  {...register('isActive')}
                  className="rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                />
                <label htmlFor="isActive" className="text-sm font-semibold text-gray-700">
                  Mark active immediately
                </label>
              </div>

              <button
                type="submit"
                disabled={createMutation.isPending}
                className="w-full py-3 px-4 bg-primary-500 text-white rounded-lg font-bold text-sm hover:bg-primary-600 transition-colors shadow-md shadow-primary-500/10 disabled:bg-primary-300"
              >
                Create Table
              </button>
            </form>
          </div>
        </div>
      </div>

      <ConfirmationDialog
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Permanently Delete Table?"
        message="Are you sure you want to permanently delete this table? Overlapping reservations may lose their allocated table."
        confirmText="Yes, Delete"
      />
    </DashboardLayout>
  );
};

export default AdminTables;
