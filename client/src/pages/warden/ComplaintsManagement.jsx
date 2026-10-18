import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/common/DashboardLayout';
import { getAllComplaints, updateComplaintStatus } from '../../api/complaint.api';
import StatusBadge from '../../components/common/StatusBadge';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';
import { MessageSquareWarning, Clock, CheckCircle2, ArrowRight } from 'lucide-react';

export default function ComplaintsManagement() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchComplaints();
  }, []);

  async function fetchComplaints() {
    try {
      setLoading(true);
      const res = await getAllComplaints();
      setComplaints(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(id, status) {
    try {
      setUpdatingId(id);
      await updateComplaintStatus(id, { status });
      toast.success(`Complaint status changed to ${status.replace('_', ' ')}!`);
      fetchComplaints();
    } catch (err) {
      toast.error('Failed to update complaint status');
    } finally {
      setUpdatingId(null);
    }
  }

  const pending = complaints.filter((c) => c.status === 'pending');
  const inProgress = complaints.filter((c) => c.status === 'in_progress');
  const resolved = complaints.filter((c) => c.status === 'resolved');

  function renderColumn(title, items, borderStyle, nextAction) {
    return (
      <div className="bg-slate-100/70 rounded-2xl p-4 border border-slate-200 flex flex-col flex-1 min-w-[280px]">
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">{title}</h3>
          <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-white text-slate-700 border">
            {items.length}
          </span>
        </div>

        <div className="space-y-3 flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No complaints</p>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 space-y-2 hover:border-slate-300 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    {item.category}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(item.raisedAt).toLocaleDateString()}
                  </span>
                </div>

                <p className="text-xs font-semibold text-slate-800 line-clamp-3">{item.description}</p>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Student: {item.student?.fullName || 'Student'}</span>
                  {item.room && <span>Room {item.room.roomNo}</span>}
                </div>

                {nextAction && (
                  <button
                    disabled={updatingId === item.id}
                    onClick={() => handleStatusChange(item.id, nextAction.status)}
                    className="w-full mt-2 py-1.5 px-3 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <span>{nextAction.label}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Complaints & Maintenance Board</h1>
          <p className="text-sm text-slate-500">
            Kanban workflow to triage student issues, dispatch hostel technicians, and mark resolutions.
          </p>
        </div>

        {loading ? (
          <Loader size="lg" text="Loading maintenance tickets..." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {renderColumn('1. Pending Triage', pending, 'border-amber-300', {
              label: 'Dispatch Technician',
              status: 'in_progress',
            })}
            {renderColumn('2. In Progress', inProgress, 'border-blue-300', {
              label: 'Mark Resolved',
              status: 'resolved',
            })}
            {renderColumn('3. Resolved', resolved, 'border-emerald-300', null)}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
