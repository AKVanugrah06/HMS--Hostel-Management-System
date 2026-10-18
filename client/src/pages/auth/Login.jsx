import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { loginUser } from '../../api/auth.api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Building2, Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';

export default function Login() {
  const { register, handleSubmit, setValue, formState: { errors } } = useForm();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || null;

  async function onSubmit(data) {
    setLoading(true);
    try {
      const res = await loginUser(data);
      const { user, token } = res.data;
      login(user, token);
      toast.success(`Welcome back, ${user.studentProfile?.fullName || user.wardenProfile?.fullName || 'User'}!`);
      
      if (from) {
        navigate(from, { replace: true });
      } else if (user.role === 'warden' || user.role === 'super_admin') {
        navigate('/warden', { replace: true });
      } else {
        navigate('/student', { replace: true });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  }

  function setDemoCredentials(role) {
    if (role === 'warden') {
      setValue('email', 'warden@hostel.edu');
      setValue('password', 'WardenPass123!');
    } else {
      setValue('email', 'student@college.edu');
      setValue('password', 'StudentPass123!');
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-500/25 mb-4">
            <Building2 className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">HostelFlow Portal</h1>
          <p className="text-slate-400 text-sm mt-1">Sign in to your hostel account</p>
        </div>

        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-100 p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                College Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  {...register('email', { required: 'Email is required' })}
                  placeholder="student@college.edu"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition-all text-slate-900"
                />
              </div>
              {errors.email && <p className="text-xs text-rose-500 mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <Link to="/forgot-password" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  {...register('password', { required: 'Password is required' })}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition-all text-slate-900"
                />
              </div>
              {errors.password && <p className="text-xs text-rose-500 mt-1">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-sm shadow-md shadow-indigo-600/25 hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Login Credentials */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
              Quick Demo Autofill
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDemoCredentials('warden')}
                className="py-1.5 px-2.5 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 text-xs font-medium text-slate-700 text-left transition-colors"
              >
                <span className="font-bold text-indigo-600 block">Warden Admin</span>
                warden@hostel.edu
              </button>
              <button
                type="button"
                onClick={() => setDemoCredentials('student')}
                className="py-1.5 px-2.5 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 text-xs font-medium text-slate-700 text-left transition-colors"
              >
                <span className="font-bold text-indigo-600 block">Student</span>
                student@college.edu
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-slate-500">
            New student?{' '}
            <Link to="/register" className="font-bold text-indigo-600 hover:text-indigo-700">
              Apply for hostel registration
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
