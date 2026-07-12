import React, { useContext, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { Loader2, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const registerSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['customer', 'admin']),
});

const Register = () => {
  const { register: registerUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'customer',
    }
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const user = await registerUser(data.name, data.email, data.password, data.role);
      toast.success('Registration successful!');
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error(error.message || 'Registration failed. Please check inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-brand-bg px-4 text-brand-text">
      {/* Top Header Ribbon */}
      <header className="absolute top-0 left-0 right-0 w-full max-w-7xl mx-auto px-6 md:px-12 py-6 flex justify-between items-center z-10 border-b border-brand-border/20">
        <Link to="/" className="flex items-center gap-1.5">
          <span className="text-xl md:text-2xl font-serif font-bold text-primary-500 tracking-wide">LUMINA</span>
          <span className="text-xs uppercase tracking-[0.25em] text-brand-muted font-bold mt-1.5">Dining</span>
        </Link>
        <Link to="/" className="text-sm font-semibold text-brand-muted hover:text-primary-500 transition-colors flex items-center gap-1.5">
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>
      </header>

      {/* Register Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white p-8 rounded-xl shadow-sm border border-brand-border mt-20 md:mt-24"
      >
        <h2 className="text-center font-serif text-3xl font-bold text-brand-text mb-2">Create Account</h2>
        <p className="text-center text-sm text-brand-muted mb-6 font-medium">Create a new account to book reservations</p>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-1">Full Name</label>
            <input
              type="text"
              {...register('name')}
              className={`w-full px-4 py-2.5 rounded-lg border bg-brand-bg/50 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all font-semibold ${
                errors.name ? 'border-red-300 focus:border-red-500' : 'border-brand-border focus:border-primary-500'
              }`}
              placeholder="John Doe"
            />
            {errors.name && <p className="mt-1 text-xs text-red-600 font-semibold">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-1">Email Address</label>
            <input
              type="email"
              {...register('email')}
              className={`w-full px-4 py-2.5 rounded-lg border bg-brand-bg/50 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all font-semibold ${
                errors.email ? 'border-red-300 focus:border-red-500' : 'border-brand-border focus:border-primary-500'
              }`}
              placeholder="you@example.com"
            />
            {errors.email && <p className="mt-1 text-xs text-red-600 font-semibold">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-1">Password</label>
            <input
              type="password"
              {...register('password')}
              className={`w-full px-4 py-2.5 rounded-lg border bg-brand-bg/50 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all font-semibold ${
                errors.password ? 'border-red-300 focus:border-red-500' : 'border-brand-border focus:border-primary-500'
              }`}
              placeholder="••••••••"
            />
            {errors.password && <p className="mt-1 text-xs text-red-600 font-semibold">{errors.password.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-1">Role (for testing purposes)</label>
            <select
              {...register('role')}
              className="w-full px-4 py-2.5 rounded-lg border border-brand-border bg-brand-bg/50 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 font-semibold text-sm"
            >
              <option value="customer">Customer</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-primary-500 text-white rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-primary-600 transition-all shadow-md shadow-primary-500/10 hover:shadow-lg hover:shadow-primary-500/20 disabled:bg-primary-200 disabled:shadow-none flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            {loading ? <Loader2 className="h-4.5 w-4.5 animate-spin" /> : 'Register'}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-brand-muted font-medium">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-500 font-bold hover:underline">
            Login here
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;
