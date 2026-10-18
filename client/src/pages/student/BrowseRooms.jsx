import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/common/DashboardLayout';
import { getRooms } from '../../api/room.api';
import { applyForRoom, getMyApplication } from '../../api/application.api';
import StatusBadge from '../../components/common/StatusBadge';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';
import { BedDouble, Users, Check, AlertCircle } from 'lucide-react';

export default function BrowseRooms() {
  const [rooms, setRooms] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [myApp, setMyApp] = useState(null);

  useEffect(() => {
    fetchData();
  }, [filter]);

  async function fetchData() {
    try {
      setLoading(true);
      const [roomsRes, appRes] = await Promise.allSettled([
        getRooms({ sharingType: filter || undefined }),
        getMyApplication(),
      ]);

      if (roomsRes.status === 'fulfilled') {
        setRooms(roomsRes.value.data);
      }
      if (appRes.status === 'fulfilled') {
        setMyApp(appRes.value.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleApply(sharingType) {
    if (myApp && ['pending', 'approved'].includes(myApp.status)) {
      toast.error('You already have an active room application.');
      return;
    }

    try {
      setSubmitting(true);
      await applyForRoom({ preferredSharingType: sharingType });
      toast.success('Room application submitted for warden review!');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Application submission failed.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Hostel Rooms & Inventory</h1>
            <p className="text-sm text-slate-500">
              Select your preferred non-AC accommodation tier. Room allocation is approved by the warden.
            </p>
          </div>

          {/* Filter dropdown */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Sharing Tiers</option>
            <option value="single">Single Room</option>
            <option value="double">Double Sharing</option>
            <option value="triple">Triple Sharing</option>
            <option value="4-sharing">4-Sharing</option>
          </select>
        </div>

        {/* Existing Application Notice */}
        {myApp && (
          <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-indigo-600 shrink-0" />
              <div>
                <p className="text-sm font-bold text-indigo-950">Active Application: {myApp.preferredSharingType}</p>
                <p className="text-xs text-indigo-700">Status: <StatusBadge status={myApp.status} /></p>
              </div>
            </div>
            {myApp.assignedRoom && (
              <span className="text-xs font-semibold px-3 py-1 bg-white rounded-lg text-indigo-700 border border-indigo-200">
                Assigned: {myApp.assignedRoom.roomNo} ({myApp.assignedRoom.block})
              </span>
            )}
          </div>
        )}

        {loading ? (
          <Loader size="lg" text="Loading room inventory..." />
        ) : rooms.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
            <BedDouble className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-700">No rooms found</h3>
            <p className="text-xs text-slate-400 mt-1">Check back once room inventory is seeded.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room) => {
              const seatsLeft = room.capacity - room.occupiedCount;
              const isFull = seatsLeft <= 0;

              return (
                <div
                  key={room.id}
                  className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-extrabold uppercase px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg">
                        {room.block} • Floor {room.floor}
                      </span>
                      <StatusBadge status={room.status} />
                    </div>

                    <h3 className="text-xl font-black text-slate-900">{room.roomNo}</h3>
                    <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mt-0.5">
                      {room.sharingType.replace('-', ' ')} (Non-AC)
                    </p>

                    <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Users className="w-4 h-4 text-slate-400" />
                        {room.occupiedCount} / {room.capacity} Occupied
                      </span>
                      <span className="font-extrabold text-slate-900 text-sm">
                        ₹{room.feePerHead?.toLocaleString()} / term
                      </span>
                    </div>
                  </div>

                  <button
                    disabled={isFull || submitting || (myApp && ['pending', 'approved'].includes(myApp.status))}
                    onClick={() => handleApply(room.sharingType)}
                    className="mt-5 w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-xs tracking-wider uppercase shadow-sm transition-all disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed"
                  >
                    {isFull ? 'Room Full' : 'Apply For Tier'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
