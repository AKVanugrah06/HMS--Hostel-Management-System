import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/common/DashboardLayout';
import { getMyComplaints, createComplaint } from '../../api/complaint.api';
import StatusBadge from '../../components/common/StatusBadge';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';
import { MessageSquareWarning, Plus, CheckCircle, Clock } from 'lucide-react';

export default function MyComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [category, setCategory] = useState('electrical');
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState(null);

  useEffect(() => {
    fetchComplaints();
  }, []);

  async function fetchComplaints() {
    try {
      setLoading(true);
      const res = await getMyComplaints();
      setComplaints(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!description.trim()) {
      toast.error('Please describe the maintenance issue');
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append('category', category);
      formData.append('description', description.trim());
      if (photo) {
        formData.append('photo', photo);
      }

      await createComplaint(formData);
      toast.success('Complaint submitted to the warden office.');
      setDescription('');
      setPhoto(null);
      setShowForm(false);
      fetchComplaints();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit complaint');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Maintenance & Complaints</h1>
            <p className="text-sm text-slate-500">
              Submit room or facility issues directly to the warden office with paperless status tracking.
            </p>
          </div>

          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs tracking-wider uppercase shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            {showForm ? 'Cancel Ticket' : 'Raise New Complaint'}
          </button>
        </div>

        {/* New Complaint Form */}
        {showForm && (
          <div className="bg-white rounded-2xl border border-indigo-100 shadow-md p-6 animate-fadeIn">
            <h2 className="text-base font-bold text-slate-900 mb-4">Log Maintenance Request</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Issue Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white"
                  >
                    <option value="electrical">Electrical (Fan, Lights, Sockets)</option>
                    <option value="plumbing">Plumbing (Tap, Shower, Drainage)</option>
                    <option value="wifi">Campus Wi-Fi / LAN Network</option>
                    <option value="furniture">Furniture / Bed / Wardrobe</option>
                    <option value="other">Other Housekeeping / General</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Attach Photo (Optional)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setPhoto(e.target.files[0])}
                    className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Issue Description
                </label>
                <textarea
                  rows="3"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detail the issue so hostel maintenance staff can bring correct parts..."
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs tracking-wider uppercase shadow-sm transition-all disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Complaints List */}
        {loading ? (
          <Loader size="lg" text="Loading maintenance records..." />
        ) : complaints.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
            <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No active maintenance tickets</h3>
            <p className="text-xs text-slate-500 mt-1">All your reported issues will appear here with live updates.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {complaints.map((c) => (
              <div
                key={c.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs font-extrabold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {c.category}
                    </span>
                    <span className="text-xs text-slate-400">• Raised on {new Date(c.raisedAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm font-medium text-slate-800">{c.description}</p>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <StatusBadge status={c.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
