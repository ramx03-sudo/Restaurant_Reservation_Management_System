import React from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';
import DashboardLayout from '../layouts/DashboardLayout';
import { formatHumanDate, formatHumanTime } from '../utils/dateHelper';
import { 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  TableProperties, 
  Percent, 
  Users, 
  TrendingUp,
  Clock,
  ArrowUpRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

const AdminDashboard = () => {
  const { data: metricsResponse, isLoading } = useQuery({
    queryKey: ['adminMetrics'],
    queryFn: () => apiClient.get('/admin/metrics'),
  });

  const metrics = metricsResponse?.data || {
    totalReservations: 0,
    activeReservations: 0,
    cancelledReservations: 0,
    totalTables: 0,
    occupancyPercentage: 0,
    todayCount: 0,
    nextReservation: null,
    dailyStats: []
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <DashboardLayout>
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8 text-brand-text"
      >
        <div>
          <h2 className="text-3xl font-bold font-serif tracking-tight">Control Center</h2>
          <p className="text-brand-muted font-medium mt-1">Real-time occupancy analytics and seating operations.</p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
          <motion.div 
            variants={cardVariants}
            whileHover={{ y: -3 }}
            className="bg-white p-6 rounded-xl border border-brand-border flex flex-col justify-between shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-brand-muted uppercase tracking-wider">Today's Bookings</span>
              <div className="h-8 w-8 rounded-lg bg-orange-50 flex items-center justify-center text-primary-500">
                <Calendar className="h-4.5 w-4.5" />
              </div>
            </div>
            <h3 className="text-3xl font-bold">{isLoading ? '...' : metrics.todayCount}</h3>
          </motion.div>

          <motion.div 
            variants={cardVariants}
            whileHover={{ y: -3 }}
            className="bg-white p-6 rounded-xl border border-brand-border flex flex-col justify-between shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-brand-muted uppercase tracking-wider">Active Bookings</span>
              <div className="h-8 w-8 rounded-lg bg-green-50/50 flex items-center justify-center text-green-600">
                <CheckCircle2 className="h-4.5 w-4.5" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-green-700">{isLoading ? '...' : metrics.activeReservations}</h3>
          </motion.div>

          <motion.div 
            variants={cardVariants}
            whileHover={{ y: -3 }}
            className="bg-white p-6 rounded-xl border border-brand-border flex flex-col justify-between shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-brand-muted uppercase tracking-wider">Cancelled</span>
              <div className="h-8 w-8 rounded-lg bg-red-50/50 flex items-center justify-center text-red-600">
                <XCircle className="h-4.5 w-4.5" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-red-600">{isLoading ? '...' : metrics.cancelledReservations}</h3>
          </motion.div>

          <motion.div 
            variants={cardVariants}
            whileHover={{ y: -3 }}
            className="bg-white p-6 rounded-xl border border-brand-border flex flex-col justify-between shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-brand-muted uppercase tracking-wider">Total Tables</span>
              <div className="h-8 w-8 rounded-lg bg-blue-50/50 flex items-center justify-center text-blue-600">
                <TableProperties className="h-4.5 w-4.5" />
              </div>
            </div>
            <h3 className="text-3xl font-bold">{isLoading ? '...' : metrics.totalTables}</h3>
          </motion.div>

          <motion.div 
            variants={cardVariants}
            whileHover={{ y: -3 }}
            className="bg-white p-6 rounded-xl border border-brand-border flex flex-col justify-between shadow-sm col-span-2 lg:col-span-1"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-brand-muted uppercase tracking-wider">Occupancy Rate</span>
              <div className="h-8 w-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
                <Percent className="h-4.5 w-4.5" />
              </div>
            </div>
            <h3 className="text-3xl font-bold">{isLoading ? '...' : `${metrics.occupancyPercentage}%`}</h3>
          </motion.div>
        </div>

        {/* Analytics Charts & Details Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recharts Booking Activity Graph */}
          <motion.div 
            variants={cardVariants}
            className="lg:col-span-2 bg-white p-6 rounded-xl border border-brand-border shadow-sm flex flex-col"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="space-y-1">
                <h3 className="text-lg font-bold font-serif flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary-500" />
                  Reservation Activity
                </h3>
                <p className="text-xs text-brand-muted font-medium">Daily reservation volumes over the last 7 days</p>
              </div>
            </div>

            <div className="h-64 w-full">
              {isLoading ? (
                <div className="h-full w-full flex items-center justify-center text-brand-muted text-sm font-semibold">
                  Loading analytics data...
                </div>
              ) : metrics.dailyStats?.length === 0 ? (
                <div className="h-full w-full flex items-center justify-center text-brand-muted text-sm font-semibold">
                  No reservation activity recorded.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={metrics.dailyStats} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#D97757" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#D97757" stopOpacity={0.01}/>
                      </linearGradient>
                    </defs>
                    <XAxis 
                      dataKey="date" 
                      stroke="#6B7280" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false} 
                      dy={10}
                    />
                    <YAxis 
                      stroke="#6B7280" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false} 
                      allowDecimals={false}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#FFFFFF', 
                        borderColor: '#E7DFD7', 
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontFamily: 'Inter',
                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
                      }} 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="count" 
                      stroke="#D97757" 
                      strokeWidth={2} 
                      fillOpacity={1} 
                      fill="url(#colorCount)" 
                      name="Bookings"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </motion.div>

          {/* Side Panels: Operational Control */}
          <motion.div 
            variants={cardVariants}
            className="bg-white rounded-xl border border-brand-border overflow-hidden flex flex-col justify-between shadow-sm"
          >
            {/* Header info */}
            <div className="p-5 bg-gradient-to-r from-primary-500 to-orange-400 text-white flex items-center gap-2">
              <Clock className="h-4.5 w-4.5" />
              <h3 className="font-serif font-bold text-sm tracking-wide">Next Seating Allocation</h3>
            </div>
            
            <div className="p-6 flex-1 flex flex-col justify-center">
              {isLoading ? (
                <div className="py-6 text-center text-brand-muted text-sm font-semibold">Loading log details...</div>
              ) : metrics.nextReservation ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-3 bg-brand-bg border border-brand-border/60 rounded-lg">
                      <span className="text-[10px] text-brand-muted font-bold uppercase tracking-wider block mb-1">Time</span>
                      <span className="text-sm font-bold">{formatHumanTime(metrics.nextReservation.time.split(' at ')[1])}</span>
                    </div>
                    <div className="p-3 bg-brand-bg border border-brand-border/60 rounded-lg">
                      <span className="text-[10px] text-brand-muted font-bold uppercase tracking-wider block mb-1">Date</span>
                      <span className="text-sm font-bold">{formatHumanDate(metrics.nextReservation.time.split(' at ')[0])}</span>
                    </div>
                  </div>
                  <div className="p-4 bg-brand-bg rounded-lg border border-brand-border/50 space-y-1.5 text-xs font-semibold text-brand-muted">
                    <div className="flex justify-between">
                      <span>Customer:</span>
                      <span className="text-brand-text">{metrics.nextReservation.customer}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Assigned Table:</span>
                      <span className="text-brand-text font-bold">{metrics.nextReservation.table}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Party Size:</span>
                      <span className="text-brand-text">{metrics.nextReservation.guests} People</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-brand-muted text-sm font-medium">No upcoming active seating.</div>
              )}
            </div>

            <div className="p-4 bg-brand-bg border-t border-brand-border flex gap-3">
              <Link to="/admin/reservations" className="btn btn-primary w-full text-center text-xs tracking-wider uppercase py-2.5">
                Reservations
              </Link>
              <Link to="/admin/tables" className="btn btn-outline w-full text-center text-xs py-2.5 bg-white">
                Tables
              </Link>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
