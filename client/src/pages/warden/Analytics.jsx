import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/common/DashboardLayout';
import { getRooms } from '../../api/room.api';
import Loader from '../../components/common/Loader';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { BarChart3, TrendingUp, DollarSign } from 'lucide-react';

export default function Analytics() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const res = await getRooms();
        setRooms(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Compute metrics by sharing type
  const tierSummary = {
    single: { type: 'Single', total: 0, occupied: 0, revenue: 0 },
    double: { type: 'Double', total: 0, occupied: 0, revenue: 0 },
    triple: { type: 'Triple', total: 0, occupied: 0, revenue: 0 },
    '4-sharing': { type: '4-Sharing', total: 0, occupied: 0, revenue: 0 },
  };

  rooms.forEach((r) => {
    const key = r.sharingType;
    if (tierSummary[key]) {
      tierSummary[key].total += r.capacity;
      tierSummary[key].occupied += r.occupiedCount;
      tierSummary[key].revenue += (r.occupiedCount || 0) * (r.feePerHead || 0);
    }
  });

  const chartData = Object.values(tierSummary);
  const totalRevenue = chartData.reduce((acc, c) => acc + c.revenue, 0);

  const pieData = chartData.map((c) => ({
    name: c.type,
    value: c.occupied,
  }));

  const COLORS = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b'];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Hostel Occupancy & Analytics</h1>
          <p className="text-sm text-slate-500">
            Automated visual telemetry on room tier distribution, bed utilization, and fee projections.
          </p>
        </div>

        {loading ? (
          <Loader size="lg" text="Generating analytics charts..." />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Bar Chart */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <h3 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-indigo-600" />
                  Capacity vs Occupancy by Room Type
                </h3>
                <p className="text-xs text-slate-500 mb-6">Total capacity compared with occupied seats</p>

                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <XAxis dataKey="type" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="total" name="Total Beds" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="occupied" name="Occupied Beds" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Pie Chart */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <h3 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-indigo-600" />
                  Student Distribution by Room Tier
                </h3>
                <p className="text-xs text-slate-500 mb-6">Proportion of occupied beds across sharing categories</p>

                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={85}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <span className="text-xs uppercase font-extrabold tracking-widest text-indigo-400">
                  Total Projected Revenue
                </span>
                <p className="text-3xl font-black mt-1">₹{totalRevenue.toLocaleString()}</p>
                <p className="text-xs text-slate-400 mt-1">
                  Based on current confirmed room allocations across all floors.
                </p>
              </div>
              <div className="px-4 py-2 bg-white/10 backdrop-blur rounded-xl border border-white/10 text-xs font-semibold">
                Updated live from database
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
