import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/common/DashboardLayout';
import { getMyPayment, submitPayment, downloadReceiptPdf } from '../../api/payment.api';
import StatusBadge from '../../components/common/StatusBadge';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';
import { CreditCard, ExternalLink, Upload, CheckCircle2, FileText, AlertCircle } from 'lucide-react';

const SMART_PORTAL_URL =
  import.meta.env.VITE_SMART_PORTAL_URL ||
  'https://mmmut.samarth.edu.in/feeportal/index.php/site/login';

export default function PaymentPage() {
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [txnId, setTxnId] = useState('');
  const [receiptFile, setReceiptFile] = useState(null);

  useEffect(() => {
    fetchPayment();
  }, []);

  async function fetchPayment() {
    try {
      setLoading(true);
      const res = await getMyPayment();
      setPayment(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!txnId.trim()) {
      toast.error('Please enter your Smart Portal transaction ID');
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append('portalTransactionId', txnId.trim());
      if (receiptFile) {
        formData.append('receipt', receiptFile);
      }

      await submitPayment(payment.id, formData);
      toast.success('Transaction submitted for warden verification!');
      fetchPayment();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit payment details');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Hostel Fee Payment</h1>
          <p className="text-sm text-slate-500">
            Pay semester accommodation dues via the official College Smart Portal and submit proof for warden audit.
          </p>
        </div>

        {loading ? (
          <Loader size="lg" text="Fetching payment records..." />
        ) : !payment ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
            <CreditCard className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No active payment challan found</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              Your fee challan with a unique reference ID is generated once the warden approves your room application.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Challan Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Reference Challan</span>
                  <p className="text-xl font-mono font-bold text-indigo-700">{payment.referenceNo}</p>
                </div>
                <StatusBadge status={payment.status} />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 py-4 text-sm">
                <div>
                  <span className="text-xs text-slate-500">Amount Due</span>
                  <p className="text-lg font-black text-slate-900">₹{payment.amountDue?.toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-xs text-slate-500">Assigned Room</span>
                  <p className="font-semibold text-slate-800">
                    {payment.application?.assignedRoom?.roomNo || 'Pending Room ID'}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-slate-500">Submission Date</span>
                  <p className="font-semibold text-slate-800">
                    {payment.submittedAt ? new Date(payment.submittedAt).toLocaleDateString() : 'Not submitted'}
                  </p>
                </div>
              </div>

              {/* Step 1: Redirect to Smart Portal if Pending */}
              {payment.status === 'pending' && (
                <div className="mt-4 p-4 rounded-xl bg-indigo-50 border border-indigo-100">
                  <p className="text-xs font-bold text-indigo-900 uppercase tracking-wider mb-1">
                    Step 1: MMMUT Samarth Portal Fee Payment
                  </p>
                  <p className="text-xs text-indigo-700 mb-3">
                    Click below to open the official MMMUT Samarth Fee Portal. Quote your reference number{' '}
                    <strong>{payment.referenceNo}</strong> during checkout.
                  </p>
                  <a
                    href={SMART_PORTAL_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-all"
                  >
                    Open MMMUT Samarth Fee Portal <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}

              {/* Step 2: Submit Txn ID & Receipt if Pending or Rejected */}
              {(payment.status === 'pending' || payment.status === 'rejected') && (
                <form onSubmit={handleSubmit} className="mt-6 pt-6 border-t border-slate-100 space-y-4">
                  <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Step 2: Submit Payment Confirmation
                  </p>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Bank / Portal Transaction ID <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={txnId}
                      onChange={(e) => setTxnId(e.target.value)}
                      placeholder="e.g. TXN98421038"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Upload Receipt / Screenshot (PDF, PNG, JPG)
                    </label>
                    <input
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={(e) => setReceiptFile(e.target.files[0])}
                      className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs tracking-wider uppercase shadow-sm transition-all disabled:opacity-50"
                  >
                    {submitting ? 'Submitting Details...' : 'Submit Transaction For Audit'}
                  </button>
                </form>
              )}

              {/* Verified State */}
              {payment.status === 'verified' && (
                <div className="mt-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                    <div>
                      <p className="text-sm font-bold text-emerald-950">Payment Verified by Warden</p>
                      <p className="text-xs text-emerald-700">Your room booking is fully locked and confirmed.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
