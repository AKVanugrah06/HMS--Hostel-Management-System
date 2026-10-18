import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  BedDouble,
  CreditCard,
  MessageSquareWarning,
  CheckSquare,
  BadgeCheck,
  BarChart3,
  HelpCircle,
} from 'lucide-react';

export default function Sidebar() {
  const { isWarden } = useAuth();

  const studentLinks = [
    { to: '/student', label: 'My Dashboard', icon: LayoutDashboard, end: true },
    { to: '/student/rooms', label: 'Browse Rooms', icon: BedDouble },
    { to: '/student/payment', label: 'Fee Payment', icon: CreditCard },
    { to: '/student/complaints', label: 'My Complaints', icon: MessageSquareWarning },
  ];

  const wardenLinks = [
    { to: '/warden', label: 'Overview', icon: LayoutDashboard, end: true },
    { to: '/warden/applications', label: 'Applications', icon: CheckSquare },
    { to: '/warden/payments', label: 'Verify Payments', icon: BadgeCheck },
    { to: '/warden/complaints', label: 'Complaints Board', icon: MessageSquareWarning },
    { to: '/warden/analytics', label: 'Occupancy & Stats', icon: BarChart3 },
  ];

  const links = isWarden ? wardenLinks : studentLinks;

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 min-h-[calc(100vh-4rem)] flex flex-col justify-between p-4 border-r border-slate-800">
      <div className="space-y-6">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 px-3 mb-2">
            {isWarden ? 'Warden Management' : 'Student Portal'}
          </p>
          <nav className="space-y-1">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
        <HelpCircle className="w-4 h-4 text-slate-500 shrink-0" />
        <span>Need help? Contact the warden admin office.</span>
      </div>
    </aside>
  );
}
