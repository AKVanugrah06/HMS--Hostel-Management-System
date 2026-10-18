import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/common/DashboardLayout';
import { getAllApplications, approveApplication, rejectApplication } from '../../api/application.api';
import StatusBadge from '../../components/common/StatusBadge';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';
import { Check, X, CheckSquare, Clock } from 'lucide-react';

export default function ApplicationsQueue() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  async function fetchApplications() {
    try {
      setLoading(true);
      const res = await getAllApplications();
      setApplications(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(id) {
    try {
      setActionId(id);
      await approveApplication(id);
      toast.success('Application approved! Room assigned & payment reference generated.');
      fetchApplications();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Approval failed. Check room availability.');
    } finally {
      setActionId(null);
    }
  }

  async function handleReject(id) {
    const reason = prompt('Please state the reason for rejection (optional):') || 'Capacity full or non-eligible';
    try {
      setActionId(id);
      await rejectApplication(id, reason);
      toast.success('Application rejected.');
      fetchApplications();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Rejection failed.');
    } finally {
      setActionId(null);
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Student Room Applications</h1>
          <p className="text-sm text-slate-500">
            Review incoming student applications. Approving an application automatically assigns an available room and issues a payment challan.
          </p>
        </div>

        {loading ? (
          <Loader size="lg" text="Fetching application queue..." />
        ) : applications.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
            <CheckSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No applications in queue</h3>
            <p className="text-xs text-slate-500 mt-1">Pending student submissions will appear here for review.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Student Details</th>
                    <th className="py-3.5 px-4">Roll No & Course</th>
                    <th className="py-3.5 px-4">Requested Tier</th>
                    <th className="py-3.5 px-4">Applied Date</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {applications.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900">{app.student?.fullName || 'Student'}</p>
                        <p className="text-xs text-slate-400">{app.student?.user?.email || app.student?.phone}</p>
                      </td>
                      <td className="py-3.5 px-4 text-xs font-medium text-slate-700">
                        {app.student?.rollNo} • {app.student?.course} (Yr {app.student?.year})
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-xs text-indigo-700 capitalize">
                          {app.preferredSharingType?.replace('-', ' ')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-500">
                        {new Date(app.appliedAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={app.status} />
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        {app.status === 'pending' ? (
                          <>
                            <button
                              disabled={actionId === app.id}
                              onClick={() => handleApprove(app.id)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors disabled:opacity-50"
                            >
                              <Check className="w-3.5 h-3.5" /> Approve
                            </button>
                            <button
                              disabled={actionId === app.id}
                              onClick={() => handleReject(app.id)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition-colors disabled:opacity-50"
                            >
                              <X className="w-3.5 h-3.5" /> Reject
                            </button>
                          </>
                        ) : (
                          <span className="text-xs text-slate-400 font-medium">Decided</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
