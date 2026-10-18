import { useAuth } from '../../context/AuthContext';
import { LogOut, User, Building2, Bell } from 'lucide-react';

export default function Navbar() {
  const { user, logout, isWarden } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 flex items-center justify-between px-6 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-100">
          <Building2 className="w-5 h-5" />
        </div>
        <div>
          <span className="text-lg font-bold tracking-tight text-slate-900 flex items-center gap-2">
            HostelFlow
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
              {isWarden ? 'ADMIN' : 'STUDENT'}
            </span>
          </span>
          <p className="text-xs text-slate-500 hidden sm:block">Campus Living Management</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {user && (
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-slate-900 leading-none">
                {user.studentProfile?.fullName || user.wardenProfile?.fullName || user.email}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">{user.email}</p>
            </div>

            <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-semibold text-sm">
              <User className="w-4 h-4" />
            </div>

            <button
              onClick={logout}
              title="Logout"
              className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-100"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
