import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/common/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { BedDouble, CreditCard, MessageSquareWarning, ShieldCheck } from 'lucide-react';

export default function StudentDashboard() {
  const { user } = useAuth();
  const student = user?.studentProfile;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 rounded-3xl p-8 text-white shadow-xl shadow-indigo-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <span className="text-xs uppercase font-bold tracking-widest px-3 py-1 bg-white/20 rounded-full inline-block mb-3">
              Student Accommodation Portal
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Welcome, {student?.fullName || user?.email}!
            </h1>
            <p className="text-indigo-100 text-sm mt-1 max-w-xl">
              Track room allocation status, submit fee payments, and log maintenance tickets all in one paperless dashboard.
            </p>
          </div>
          <Link
            to="/student/rooms"
            className="px-5 py-3 rounded-2xl bg-white text-indigo-700 hover:bg-indigo-50 font-bold text-sm shadow-md transition-all shrink-0 flex items-center gap-2"
          >
            <BedDouble className="w-4 h-4" />
            Browse Available Rooms
          </Link>
        </div>

        {/* Quick Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            to="/student/rooms"
            className="glass-card p-6 rounded-2xl hover:shadow-lg hover:border-indigo-200 transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <BedDouble className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
              1. Choose a Room
            </h3>
            <p className="text-slate-500 text-xs mt-1.5">
              Explore Single, Double, Triple, or 4-Sharing non-AC rooms with live real-time availability.
            </p>
          </Link>

          <Link
            to="/student/payment"
            className="glass-card p-6 rounded-2xl hover:shadow-lg hover:border-indigo-200 transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <CreditCard className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
              2. Smart Portal Fee Payment
            </h3>
            <p className="text-slate-500 text-xs mt-1.5">
              Get an internal reference ID, pay via the college portal, and submit proof for warden verification.
            </p>
          </Link>

          <Link
            to="/student/complaints"
            className="glass-card p-6 rounded-2xl hover:shadow-lg hover:border-indigo-200 transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <MessageSquareWarning className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
              3. Room Maintenance
            </h3>
            <p className="text-slate-500 text-xs mt-1.5">
              Raise electrical, plumbing, or wifi complaints online with photo attachments and live tracking.
            </p>
          </Link>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-600" />
            Your Academic Profile
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="p-3 bg-slate-50 rounded-xl">
              <p className="text-xs text-slate-500">Roll Number</p>
              <p className="font-semibold text-slate-800">{student?.rollNo || 'Pending'}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <p className="text-xs text-slate-500">Course / Branch</p>
              <p className="font-semibold text-slate-800">{student?.course || 'Pending'}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <p className="text-xs text-slate-500">Year of Study</p>
              <p className="font-semibold text-slate-800">{student?.year ? `Year ${student.year}` : 'Pending'}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <p className="text-xs text-slate-500">Registered Phone</p>
              <p className="font-semibold text-slate-800">{student?.phone || 'Pending'}</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
