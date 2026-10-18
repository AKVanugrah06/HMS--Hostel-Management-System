import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/common/DashboardLayout';
import { getPendingPayments, verifyPayment } from '../../api/payment.api';
import StatusBadge from '../../components/common/StatusBadge';
import Loader from '../../components/common/Loader';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';
import { BadgeCheck, Check, X, FileText, ExternalLink } from 'lucide-react';

const BACKEND_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');

function getFullFileUrl(path) {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${BACKEND_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
}

export default function PaymentVerificationQueue() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePayment, setActivePayment] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchPayments();
  }, []);

  async function fetchPayments() {
    try {
      setLoading(true);
      const res = await getPendingPayments();
      setPayments(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(id, status) {
    try {
      setActionLoading(true);
      await verifyPayment(id, { status });
      toast.success(`Payment marked as ${status}!`);
      setActivePayment(null);
      fetchPayments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update payment status');
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Payment Verification Queue</h1>
          <p className="text-sm text-slate-500">
            Audit external college Smart Portal transactions against student reference numbers and confirm room bookings.
          </p>
        </div>

        {loading ? (
          <Loader size="lg" text="Loading verification requests..." />
        ) : payments.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
            <BadgeCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No payments pending audit</h3>
            <p className="text-xs text-slate-500 mt-1">
              When students pay on the college Smart Portal and submit their transaction ID, they will appear here.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Student</th>
                    <th className="py-3.5 px-4">Challan Ref</th>
                    <th className="py-3.5 px-4">Smart Portal Txn ID</th>
                    <th className="py-3.5 px-4">Amount</th>
                    <th className="py-3.5 px-4">Receipt Proof</th>
                    <th className="py-3.5 px-4 text-right">Verification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900">{p.student?.fullName}</p>
                        <p className="text-xs text-slate-400">{p.student?.rollNo}</p>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-xs text-indigo-700">
                        {p.referenceNo}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs font-semibold text-slate-800">
                        {p.portalTransactionId || '—'}
                      </td>
                      <td className="py-3.5 px-4 font-extrabold text-slate-900">
                        ₹{p.amountDue?.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4">
                        {p.receiptUploadUrl ? (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setActivePayment(p)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs transition-colors shadow-sm"
                            >
                              <FileText className="w-3.5 h-3.5" /> View Proof
                            </button>
                            <a
                              href={getFullFileUrl(p.receiptUploadUrl)}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Open receipt in new tab"
                              className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100 transition-colors"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">None uploaded</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button
                          disabled={actionLoading}
                          onClick={() => handleVerify(p.id, 'verified')}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors disabled:opacity-50"
                        >
                          <Check className="w-3.5 h-3.5" /> Confirm
                        </button>
                        <button
                          disabled={actionLoading}
                          onClick={() => handleVerify(p.id, 'rejected')}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition-colors disabled:opacity-50"
                        >
                          <X className="w-3.5 h-3.5" /> Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* In-App Interactive Proof Audit Modal */}
        {activePayment && (
          <Modal
            isOpen={!!activePayment}
            onClose={() => setActivePayment(null)}
            title="Student Payment Proof Audit"
            maxWidth="max-w-2xl"
          >
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl grid grid-cols-2 gap-3 text-xs border border-slate-100">
                <div>
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Student Details</span>
                  <p className="font-bold text-slate-800 text-sm mt-0.5">{activePayment.student?.fullName}</p>
                  <p className="text-slate-500 font-medium">Roll No: {activePayment.student?.rollNo}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Challan Reference</span>
                  <p className="font-mono font-bold text-indigo-700 text-sm mt-0.5">{activePayment.referenceNo}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Smart Portal Txn ID</span>
                  <p className="font-mono font-bold text-slate-900 text-sm mt-0.5">
                    {activePayment.portalTransactionId || 'None'}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Fee Amount</span>
                  <p className="font-black text-slate-900 text-base mt-0.5">
                    ₹{activePayment.amountDue?.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl p-3 bg-slate-900/5">
                <div className="flex items-center justify-between mb-2 px-1">
                  <span className="text-xs font-bold text-slate-700">Document Preview</span>
                  <a
                    href={getFullFileUrl(activePayment.receiptUploadUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1"
                  >
                    Open Fullscreen in New Tab <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                {activePayment.receiptUploadUrl?.toLowerCase().endsWith('.pdf') ? (
                  <iframe
                    src={getFullFileUrl(activePayment.receiptUploadUrl)}
                    title="Receipt Document"
                    className="w-full h-96 rounded-lg border border-slate-200 bg-white"
                  />
                ) : (
                  <div className="flex items-center justify-center bg-slate-100 rounded-lg p-2 max-h-[420px] overflow-auto">
                    <img
                      src={getFullFileUrl(activePayment.receiptUploadUrl)}
                      alt="Payment Proof Receipt"
                      className="max-h-96 max-w-full rounded object-contain shadow-sm"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.alt = 'Preview not rendered. Click Open Fullscreen in New Tab to view.';
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActivePayment(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <div className="flex items-center gap-2">
                  <button
                    disabled={actionLoading}
                    onClick={() => handleVerify(activePayment.id, 'rejected')}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors disabled:opacity-50 inline-flex items-center gap-1"
                  >
                    <X className="w-3.5 h-3.5" /> Reject Proof
                  </button>
                  <button
                    disabled={actionLoading}
                    onClick={() => handleVerify(activePayment.id, 'verified')}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors disabled:opacity-50 inline-flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" /> Confirm & Verify Booking
                  </button>
                </div>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </DashboardLayout>
  );
}
