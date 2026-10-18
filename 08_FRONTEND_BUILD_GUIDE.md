# Frontend Build Guide (Detailed)
## Online Hostel Management System — React (Vite) + Tailwind CSS

This guide goes page-by-page and component-by-component. Follow phases in order — each phase is demoable on its own once the matching backend routes exist (see `07_BACKEND_BUILD_GUIDE.md`).

---

## 1. Folder Structure

```
client/
├── src/
│   ├── api/
│   │   ├── axiosInstance.js
│   │   ├── auth.api.js
│   │   ├── room.api.js
│   │   ├── application.api.js
│   │   ├── payment.api.js
│   │   └── complaint.api.js
│   ├── components/
│   │   ├── common/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── StatusBadge.jsx
│   │   │   ├── Loader.jsx
│   │   │   └── Modal.jsx
│   │   ├── student/
│   │   │   ├── RoomCard.jsx
│   │   │   ├── ApplicationStatusCard.jsx
│   │   │   ├── PaymentCard.jsx
│   │   │   └── ComplaintForm.jsx
│   │   └── warden/
│   │       ├── ApplicationRow.jsx
│   │       ├── PaymentVerificationRow.jsx
│   │       ├── OccupancyGrid.jsx
│   │       └── ComplaintBoard.jsx
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── Register.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── VerifyEmail.jsx
│   │   │   └── ForgotPassword.jsx
│   │   ├── student/
│   │   │   ├── StudentDashboard.jsx
│   │   │   ├── BrowseRooms.jsx
│   │   │   ├── ApplyRoom.jsx
│   │   │   ├── PaymentPage.jsx
│   │   │   └── MyComplaints.jsx
│   │   └── warden/
│   │       ├── WardenDashboard.jsx
│   │       ├── ApplicationsQueue.jsx
│   │       ├── PaymentVerificationQueue.jsx
│   │       ├── ComplaintsManagement.jsx
│   │       └── Analytics.jsx
│   ├── hooks/
│   │   └── useAuth.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── .env
├── index.html
├── package.json
└── tailwind.config.js
```

---

## 2. Phase 0 — Project Setup

```bash
npm create vite@latest client -- --template react
cd client
npm install react-router-dom axios react-hook-form react-hot-toast recharts
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

**`tailwind.config.js`:**
```javascript
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: { extend: {} },
  plugins: [],
};
```

**`src/index.css`:**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

**`.env`:**
```
VITE_API_BASE_URL=http://localhost:5000/api
```

**`src/api/axiosInstance.js`:**
```javascript
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); // or use context/state
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

axiosInstance.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default axiosInstance;
```

**✅ Checkpoint:** `npm run dev` runs, Tailwind classes render correctly on a test div.

---

## 3. Phase 1 — Auth Context & Routing Shell

**`src/context/AuthContext.jsx`:**
```jsx
import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));
    setLoading(false);
  }, []);

  function login(userData, token) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
```

**`src/components/common/ProtectedRoute.jsx`:**
```jsx
import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

export default function ProtectedRoute({ children, allowedRole }) {
  const { user, loading } = useContext(AuthContext);
  if (loading) return null;
  if (!user) return <Navigate to="/login" />;
  if (allowedRole && user.role !== allowedRole) return <Navigate to="/" />;
  return children;
}
```

**`src/App.jsx`** — route map:
```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';

import Register from './pages/auth/Register';
import Login from './pages/auth/Login';
import VerifyEmail from './pages/auth/VerifyEmail';

import StudentDashboard from './pages/student/StudentDashboard';
import BrowseRooms from './pages/student/BrowseRooms';
import PaymentPage from './pages/student/PaymentPage';
import MyComplaints from './pages/student/MyComplaints';

import WardenDashboard from './pages/warden/WardenDashboard';
import ApplicationsQueue from './pages/warden/ApplicationsQueue';
import PaymentVerificationQueue from './pages/warden/PaymentVerificationQueue';
import ComplaintsManagement from './pages/warden/ComplaintsManagement';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/verify-email" element={<VerifyEmail />} />

          <Route path="/student" element={
            <ProtectedRoute allowedRole="student"><StudentDashboard /></ProtectedRoute>
          } />
          <Route path="/student/rooms" element={
            <ProtectedRoute allowedRole="student"><BrowseRooms /></ProtectedRoute>
          } />
          <Route path="/student/payment" element={
            <ProtectedRoute allowedRole="student"><PaymentPage /></ProtectedRoute>
          } />
          <Route path="/student/complaints" element={
            <ProtectedRoute allowedRole="student"><MyComplaints /></ProtectedRoute>
          } />

          <Route path="/warden" element={
            <ProtectedRoute allowedRole="warden"><WardenDashboard /></ProtectedRoute>
          } />
          <Route path="/warden/applications" element={
            <ProtectedRoute allowedRole="warden"><ApplicationsQueue /></ProtectedRoute>
          } />
          <Route path="/warden/payments" element={
            <ProtectedRoute allowedRole="warden"><PaymentVerificationQueue /></ProtectedRoute>
          } />
          <Route path="/warden/complaints" element={
            <ProtectedRoute allowedRole="warden"><ComplaintsManagement /></ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
```

**✅ Checkpoint:** Routing shell works, protected routes redirect correctly when logged out.

---

## 4. Phase 2 — Auth Pages

**`src/pages/auth/Register.jsx`** — use `react-hook-form`:
```jsx
import { useForm } from 'react-hook-form';
import { registerStudent } from '../../api/auth.api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();

  async function onSubmit(data) {
    try {
      await registerStudent(data);
      toast.success('Registered! Check your email to verify.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-md mx-auto mt-10 space-y-4">
      <h1 className="text-2xl font-bold">Student Registration</h1>
      <input {...register('fullName', { required: true })} placeholder="Full Name" className="w-full border p-2 rounded" />
      <input {...register('email', { required: true })} placeholder="College Email" className="w-full border p-2 rounded" />
      <input {...register('rollNo', { required: true })} placeholder="Roll No" className="w-full border p-2 rounded" />
      <input {...register('phone', { required: true })} placeholder="Phone" className="w-full border p-2 rounded" />
      <input type="password" {...register('password', { required: true, minLength: 6 })} placeholder="Password" className="w-full border p-2 rounded" />
      <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">Register</button>
    </form>
  );
}
```

Build `Login.jsx`, `VerifyEmail.jsx`, `ForgotPassword.jsx` the same way — form + API call + toast feedback + redirect.

**`src/api/auth.api.js`:**
```javascript
import axiosInstance from './axiosInstance';

export const registerStudent = (data) => axiosInstance.post('/auth/register', data);
export const verifyEmail = (data) => axiosInstance.post('/auth/verify-email', data);
export const loginUser = (data) => axiosInstance.post('/auth/login', data);
export const forgotPassword = (data) => axiosInstance.post('/auth/forgot-password', data);
export const resetPassword = (data) => axiosInstance.post('/auth/reset-password', data);
```

**✅ Checkpoint:** Full auth loop works against the live backend — register → verify → login → redirected to correct dashboard by role.

---

## 5. Phase 3 — Student: Browse Rooms & Apply

**`src/components/student/RoomCard.jsx`:**
```jsx
export default function RoomCard({ room, onApply }) {
  const seatsLeft = room.capacity - room.occupiedCount;
  return (
    <div className="border rounded-lg p-4 shadow-sm">
      <h3 className="font-semibold">{room.roomNo} — {room.block}</h3>
      <p className="text-sm text-gray-600 capitalize">{room.sharingType.replace('-', ' ')}</p>
      <p className="text-sm">Seats left: {seatsLeft}/{room.capacity}</p>
      <p className="text-sm font-medium">₹{room.feePerHead}/term</p>
      <button
        disabled={seatsLeft === 0}
        onClick={() => onApply(room.sharingType)}
        className="mt-2 w-full bg-blue-600 text-white p-2 rounded disabled:bg-gray-400"
      >
        {seatsLeft === 0 ? 'Full' : 'Apply'}
      </button>
    </div>
  );
}
```

**`src/pages/student/BrowseRooms.jsx`** — fetch + filter + grid of `RoomCard`:
```jsx
import { useEffect, useState } from 'react';
import { getRooms } from '../../api/room.api';
import { applyForRoom } from '../../api/application.api';
import RoomCard from '../../components/student/RoomCard';
import toast from 'react-hot-toast';

export default function BrowseRooms() {
  const [rooms, setRooms] = useState([]);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    getRooms(filter).then((res) => setRooms(res.data));
  }, [filter]);

  async function handleApply(sharingType) {
    try {
      await applyForRoom({ preferredSharingType: sharingType });
      toast.success('Application submitted!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Application failed');
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Available Rooms</h1>
      <select onChange={(e) => setFilter(e.target.value)} className="mb-4 border p-2 rounded">
        <option value="">All Types</option>
        <option value="single">Single</option>
        <option value="double">Double</option>
        <option value="triple">Triple</option>
        <option value="4-sharing">4-Sharing</option>
      </select>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {rooms.map((room) => (
          <RoomCard key={room.id} room={room} onApply={handleApply} />
        ))}
      </div>
    </div>
  );
}
```

**✅ Checkpoint:** Rooms load and filter correctly; Apply button creates an application and disables correctly when full.

---

## 6. Phase 4 — Student: Payment Page (Smart Portal Redirect)

**`src/pages/student/PaymentPage.jsx`:**
```jsx
import { useEffect, useState } from 'react';
import { getMyPayment, submitPayment } from '../../api/payment.api';
import toast from 'react-hot-toast';
import StatusBadge from '../../components/common/StatusBadge';

const SMART_PORTAL_URL = import.meta.env.VITE_SMART_PORTAL_URL;

export default function PaymentPage() {
  const [payment, setPayment] = useState(null);
  const [txnId, setTxnId] = useState('');
  const [file, setFile] = useState(null);

  useEffect(() => {
    getMyPayment().then((res) => setPayment(res.data));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData();
    formData.append('portalTransactionId', txnId);
    if (file) formData.append('receipt', file);
    try {
      await submitPayment(payment.id, formData);
      toast.success('Transaction submitted for verification!');
    } catch (err) {
      toast.error('Submission failed');
    }
  }

  if (!payment) return <p className="p-6">No payment record yet — apply for a room first.</p>;

  return (
    <div className="max-w-lg mx-auto p-6">
      <h1 className="text-xl font-bold mb-2">Fee Payment</h1>
      <p>Reference No: <strong>{payment.referenceNo}</strong></p>
      <p>Amount Due: ₹{payment.amountDue}</p>
      <p>Status: <StatusBadge status={payment.status} /></p>

      {payment.status === 'pending' && (
        <a
          href={SMART_PORTAL_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-4 bg-green-600 text-white px-4 py-2 rounded"
        >
          Pay Now on College Smart Portal
        </a>
      )}

      {(payment.status === 'pending' || payment.status === 'rejected') && (
        <form onSubmit={handleSubmit} className="mt-6 space-y-3">
          <input
            value={txnId}
            onChange={(e) => setTxnId(e.target.value)}
            placeholder="Transaction ID from Smart Portal"
            className="w-full border p-2 rounded"
            required
          />
          <input type="file" onChange={(e) => setFile(e.target.files[0])} accept=".pdf,.jpg,.jpeg,.png" />
          <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">
            Submit Transaction Details
          </button>
        </form>
      )}
    </div>
  );
}
```

**✅ Checkpoint:** Student can click through to the (real or placeholder) Smart Portal URL, then come back and submit a transaction ID + receipt file, which reflects correctly in the warden's queue.

---

## 7. Phase 5 — Warden Dashboard Pages

**`src/components/warden/ApplicationRow.jsx`:**
```jsx
export default function ApplicationRow({ application, onApprove, onReject }) {
  return (
    <tr className="border-b">
      <td className="p-2">{application.student.fullName}</td>
      <td className="p-2 capitalize">{application.preferredSharingType}</td>
      <td className="p-2">{application.status}</td>
      <td className="p-2 space-x-2">
        <button onClick={() => onApprove(application.id)} className="bg-green-600 text-white px-3 py-1 rounded text-sm">Approve</button>
        <button onClick={() => onReject(application.id)} className="bg-red-600 text-white px-3 py-1 rounded text-sm">Reject</button>
      </td>
    </tr>
  );
}
```

**`src/pages/warden/ApplicationsQueue.jsx`** follows the same fetch-list-render-actions pattern as `BrowseRooms.jsx` — fetch pending applications, render `ApplicationRow` list, call approve/reject API, refresh list, toast feedback.

**`src/components/warden/OccupancyGrid.jsx`** — simple colored grid:
```jsx
export default function OccupancyGrid({ rooms }) {
  return (
    <div className="grid grid-cols-6 gap-2">
      {rooms.map((room) => (
        <div
          key={room.id}
          className={`p-2 rounded text-center text-xs text-white ${
            room.status === 'full' ? 'bg-red-500' : 'bg-green-500'
          }`}
          title={`${room.roomNo}: ${room.occupiedCount}/${room.capacity}`}
        >
          {room.roomNo}
        </div>
      ))}
    </div>
  );
}
```

**`src/pages/warden/Analytics.jsx`** — Recharts bar/pie chart for occupancy by sharing type and revenue collected:
```jsx
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function Analytics({ data }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <XAxis dataKey="sharingType" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="occupied" fill="#2563eb" />
      </BarChart>
    </ResponsiveContainer>
  );
}
```

**✅ Checkpoint:** Warden can approve/reject applications, verify payments, see occupancy grid update live, and view basic charts.

---

## 8. Phase 6 — Complaints Pages

- `src/components/student/ComplaintForm.jsx` — category dropdown + textarea + optional photo upload + submit
- `src/pages/student/MyComplaints.jsx` — list of student's complaints with `StatusBadge`
- `src/components/warden/ComplaintBoard.jsx` — 3-column Kanban-style layout (Pending / In Progress / Resolved) using simple flex/grid, with a dropdown or drag-free status buttons on each card (drag-and-drop is a nice-to-have, not required)

**✅ Checkpoint:** Full complaint loop visible and functional on both sides.

---

## 9. Phase 7 — Shared/Polish Components

- `Navbar.jsx` — shows user name, role, logout button
- `Sidebar.jsx` — role-based nav links (different for student vs warden)
- `StatusBadge.jsx` — colored pill component reused across applications/payments/complaints:
```jsx
const COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  submitted: 'bg-blue-100 text-blue-800',
  verified: 'bg-green-100 text-green-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  resolved: 'bg-green-100 text-green-800',
  in_progress: 'bg-blue-100 text-blue-800',
};

export default function StatusBadge({ status }) {
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${COLORS[status] || 'bg-gray-100'}`}>
      {status.replace('_', ' ')}
    </span>
  );
}
```
- `Loader.jsx` — simple spinner shown during API calls
- `Modal.jsx` — reusable confirm dialog (e.g., "Are you sure you want to reject this application?")

---

## 10. Phase 8 — Responsive & Accessibility Pass

- Test every page at mobile width (Tailwind's `md:` breakpoints already used above — verify grids collapse to 1 column on small screens).
- Add `aria-label`s to icon-only buttons.
- Ensure form inputs have associated labels (even visually hidden ones) for screen readers.
- Check color contrast on status badges.

---

## 11. Deployment Notes (Frontend)

1. Set `VITE_API_BASE_URL` and `VITE_SMART_PORTAL_URL` in Vercel/Netlify's environment variable settings (pointing to your deployed backend URL).
2. Build command: `npm run build`
3. Output directory: `dist`
4. Deploy, then do a full smoke test: register → verify → login → apply → pay → submit txn → warden verify → complaint flow — all on the live URL.

---

## 12. Frontend Build Order Summary

| Phase | What you build | Depends on backend phase |
|---|---|---|
| 0 | Project setup, Tailwind, Axios | — |
| 1 | Auth context, routing shell | Phase 2 (auth routes) |
| 2 | Register/Login/Verify pages | Phase 2 |
| 3 | Browse rooms + apply | Phase 3 |
| 4 | Payment page (redirect flow) | Phase 4 |
| 5 | Warden dashboard (approvals, verification, occupancy, analytics) | Phase 3 & 4 |
| 6 | Complaints (student + warden) | Phase 5 |
| 7 | Shared components polish | — |
| 8 | Responsive/accessibility pass | — |
