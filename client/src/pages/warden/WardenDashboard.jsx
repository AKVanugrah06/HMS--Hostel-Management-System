import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/common/DashboardLayout';
import { getRooms, getOccupancyStats } from '../../api/room.api';
import { getAllApplications } from '../../api/application.api';
import { getPendingPayments } from '../../api/payment.api';
import { getAllComplaints } from '../../api/complaint.api';
import Loader from '../../components/common/Loader';
import {
  Users,
  BedDouble,
  CheckSquare,
  BadgeCheck,
  MessageSquareWarning,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

export default function WardenDashboard() {
  const [stats, setStats] = useState({
    totalRooms: 0,
    totalBeds: 0,
    occupiedBeds: 0,
    pendingApps: 0,
    pendingPayments: 0,
    openComplaints: 0,
  });
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    try {
      setLoading(true);
      const [roomsRes, appsRes, paymentsRes, complaintsRes] = await Promise.allSettled([
        getRooms(),
        getAllApplications({ status: 'pending' }),
        getPendingPayments(),
        getAllComplaints({ status: 'pending' }),
      ]);

      let roomList = [];
      if (roomsRes.status === 'fulfilled') {
        roomList = roomsRes.value.data;
        setRooms(roomList);
      }

      const totalBeds = roomList.reduce((acc, r) => acc + (r.capacity || 0), 0);
      const occupiedBeds = roomList.reduce((acc, r) => acc + (r.occupiedCount || 0), 0);

      setStats({
        totalRooms: roomList.length,
        totalBeds,
        occupiedBeds,
        pendingApps: appsRes.status === 'fulfilled' ? appsRes.value.data.length : 0,
        pendingPayments: paymentsRes.status === 'fulfilled' ? paymentsRes.value.data.length : 0,
        openComplaints: complaintsRes.status === 'fulfilled' ? complaintsRes.value.data.length : 0,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const occupancyRate = stats.totalBeds > 0 ? Math.round((stats.occupiedBeds / stats.totalBeds) * 100) : 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
            Warden Control Center
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-2">
            Hostel Operational Overview
          </h1>
          <p className="text-sm text-slate-500">
            Real-time live status of room inventory, pending student approvals, and fee reconciliation.
          </p>
        </div>

        {loading ? (
          <Loader size="lg" text="Compiling dashboard metrics..." />
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <div className="flex items-center justify-between text-slate-400 mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider">Occupancy Rate</span>
                  <TrendingUp className="w-4 h-4 text-indigo-600" />
                </div>
                <p className="text-3xl font-black text-slate-900">{occupancyRate}%</p>
                <p className="text-xs text-slate-500 mt-1">
                  {stats.occupiedBeds} of {stats.totalBeds} total beds filled
                </p>
              </div>

              <Link
                to="/warden/applications"
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:border-indigo-400 transition-all group"
              >
                <div className="flex items-center justify-between text-slate-400 mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider group-hover:text-indigo-600">
                    Pending Applications
                  </span>
                  <CheckSquare className="w-4 h-4 text-amber-500" />
                </div>
                <p className="text-3xl font-black text-slate-900">{stats.pendingApps}</p>
                <p className="text-xs text-indigo-600 font-semibold mt-1 flex items-center gap-1">
                  Review queue <ArrowRight className="w-3 h-3" />
                </p>
              </Link>

              <Link
                to="/warden/payments"
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:border-indigo-400 transition-all group"
              >
                <div className="flex items-center justify-between text-slate-400 mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider group-hover:text-indigo-600">
                    Payment Verifications
                  </span>
                  <BadgeCheck className="w-4 h-4 text-emerald-500" />
                </div>
                <p className="text-3xl font-black text-slate-900">{stats.pendingPayments}</p>
                <p className="text-xs text-indigo-600 font-semibold mt-1 flex items-center gap-1">
                  Verify receipts <ArrowRight className="w-3 h-3" />
                </p>
              </Link>

              <Link
                to="/warden/complaints"
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:border-indigo-400 transition-all group"
              >
                <div className="flex items-center justify-between text-slate-400 mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider group-hover:text-indigo-600">
                    Open Complaints
                  </span>
                  <MessageSquareWarning className="w-4 h-4 text-rose-500" />
                </div>
                <p className="text-3xl font-black text-slate-900">{stats.openComplaints}</p>
                <p className="text-xs text-indigo-600 font-semibold mt-1 flex items-center gap-1">
                  Manage board <ArrowRight className="w-3 h-3" />
                </p>
              </Link>
            </div>

            {/* Live Visual Occupancy Grid Preview */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Block & Floor Occupancy Matrix</h2>
                  <p className="text-xs text-slate-500">
                    Green = Available capacity | Red = Fully booked | Blue/Purple = Maintenance
                  </p>
                </div>
                <div className="flex items-center gap-4 text-xs font-semibold">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-emerald-500" /> Available
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-rose-500" /> Full
                  </span>
                </div>
              </div>

              {rooms.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">
                  No rooms seeded yet. Run database seeding in Phase 2 to view the live grid.
                </p>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2.5">
                  {rooms.map((r) => {
                    const isFull = r.occupiedCount >= r.capacity;
                    return (
                      <div
                        key={r.id}
                        className={`p-2.5 rounded-xl border text-center transition-all ${
                          isFull
                            ? 'bg-rose-50 border-rose-200 text-rose-800'
                            : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        }`}
                        title={`${r.roomNo} (${r.block}) - ${r.occupiedCount}/${r.capacity} beds`}
                      >
                        <p className="font-extrabold text-xs">{r.roomNo}</p>
                        <p className="text-[10px] font-medium opacity-80">
                          {r.occupiedCount}/{r.capacity}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
