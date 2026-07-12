import React, { useContext, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

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
    <div className="flex min-h-screen items-center justify-center bg-orange-50/20 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border border-orange-100">
        <h2 className="text-center font-serif text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
        <p className="text-center text-sm text-gray-500 mb-6 font-medium">Create a new account to book reservations</p>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              {...register('name')}
              className={`w-full px-4 py-2.5 rounded-lg border bg-orange-50/10 focus:outline-none focus:ring-2 focus:ring-primary-500/20 ${
                errors.name ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-primary-500'
              }`}
              placeholder="John Doe"
            />
            {errors.name && <p className="mt-1 text-xs text-red-600 font-semibold">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              {...register('email')}
              className={`w-full px-4 py-2.5 rounded-lg border bg-orange-50/10 focus:outline-none focus:ring-2 focus:ring-primary-500/20 ${
                errors.email ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-primary-500'
              }`}
              placeholder="you@example.com"
            />
            {errors.email && <p className="mt-1 text-xs text-red-600 font-semibold">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
            <input
              type="password"
              {...register('password')}
              className={`w-full px-4 py-2.5 rounded-lg border bg-orange-50/10 focus:outline-none focus:ring-2 focus:ring-primary-500/20 ${
                errors.password ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-primary-500'
              }`}
              placeholder="••••••••"
            />
            {errors.password && <p className="mt-1 text-xs text-red-600 font-semibold">{errors.password.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Role (for testing purposes)</label>
            <select
              {...register('role')}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-orange-50/10 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            >
              <option value="customer">Customer</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-primary-500 text-white rounded-lg font-bold text-sm hover:bg-primary-600 transition-colors shadow-md shadow-primary-500/10 hover:shadow-lg hover:shadow-primary-500/20 disabled:bg-primary-300 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Register'}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-gray-600 font-medium">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-500 font-bold hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
