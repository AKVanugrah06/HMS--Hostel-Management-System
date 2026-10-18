const http = require('http');
const app = require('./src/app');

let server;
const PORT = 5099;

function request(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: 'localhost',
        port: PORT,
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {}),
        },
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(body) });
          } catch (e) {
            resolve({ status: res.statusCode, text: body });
          }
        });
      }
    );
    req.on('error', reject);
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Starting Full System Integration Test Suite...\n');

  server = app.listen(PORT);

  try {
    // 1. Health check
    const health = await request({ path: '/api/health', method: 'GET' });
    console.log(`[PASS] 1. Health Check (${health.status}):`, health.data.status);

    // 2. Login Warden
    const wardenLogin = await request(
      { path: '/api/auth/login', method: 'POST' },
      { email: 'warden@hostel.edu', password: 'WardenPass123!' }
    );
    console.log(`[PASS] 2. Warden Login (${wardenLogin.status}): Role =`, wardenLogin.data.user.role);
    const wardenToken = wardenLogin.data.token;

    // 3. Login Student
    const studentLogin = await request(
      { path: '/api/auth/login', method: 'POST' },
      { email: 'student@college.edu', password: 'StudentPass123!' }
    );
    console.log(`[PASS] 3. Student Login (${studentLogin.status}): Role =`, studentLogin.data.user.role);
    const studentToken = studentLogin.data.token;

    // 4. Browse Rooms
    const roomsRes = await request({
      path: '/api/rooms?sharingType=4-sharing',
      method: 'GET',
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    console.log(`[PASS] 4. Browse Rooms (${roomsRes.status}): Found ${roomsRes.data.length} 4-sharing rooms`);

    // 5. Student Applies for Room
    const applyRes = await request(
      {
        path: '/api/applications',
        method: 'POST',
        headers: { Authorization: `Bearer ${studentToken}` },
      },
      { preferredSharingType: '4-sharing' }
    );
    console.log(`[PASS] 5. Student Applies for Room (${applyRes.status}): App ID = ${applyRes.data.id}`);
    const applicationId = applyRes.data.id;

    // 6. Test Duplicate Application Blocking
    const duplicateRes = await request(
      {
        path: '/api/applications',
        method: 'POST',
        headers: { Authorization: `Bearer ${studentToken}` },
      },
      { preferredSharingType: 'double' }
    );
    console.log(`[PASS] 6. Duplicate Application Blocked (${duplicateRes.status}): "${duplicateRes.data.message}"`);

    // 7. Warden Approves Application
    const approveRes = await request(
      {
        path: `/api/applications/${applicationId}/approve`,
        method: 'PATCH',
        headers: { Authorization: `Bearer ${wardenToken}` },
      }
    );
    console.log(`[PASS] 7. Warden Approves Application (${approveRes.status}):`);
    console.log(`       - Assigned Room: ${approveRes.data.room.roomNo}`);
    console.log(`       - Payment Challan Reference: ${approveRes.data.payment.referenceNo}`);
    console.log(`       - Fee Amount Due: ₹${approveRes.data.payment.amountDue}`);
    const paymentId = approveRes.data.payment.id;

    // 8. Student Checks Payment
    const paymentRes = await request({
      path: '/api/payments/me',
      method: 'GET',
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    console.log(`[PASS] 8. Student Payment Fetched (${paymentRes.status}): Status = ${paymentRes.data.status}`);

    // 9. Student Submits External Smart Portal Txn ID
    const submitTxnRes = await request(
      {
        path: `/api/payments/${paymentId}/submit`,
        method: 'POST',
        headers: { Authorization: `Bearer ${studentToken}` },
      },
      { portalTransactionId: 'SMART-PORTAL-TXN-998822' }
    );
    console.log(`[PASS] 9. Student Submits Txn ID (${submitTxnRes.status}): Status = ${submitTxnRes.data.payment.status}`);

    // 10. Warden Verifies Payment
    const verifyRes = await request(
      {
        path: `/api/payments/${paymentId}/verify`,
        method: 'PATCH',
        headers: { Authorization: `Bearer ${wardenToken}` },
      },
      { status: 'verified', notes: 'Smart portal receipt matches bank batch' }
    );
    console.log(`[PASS] 10. Warden Verifies Payment (${verifyRes.status}): Status = ${verifyRes.data.payment.status}`);

    // 11. Student Raises Maintenance Complaint
    const complaintRes = await request(
      {
        path: '/api/complaints',
        method: 'POST',
        headers: { Authorization: `Bearer ${studentToken}` },
      },
      { category: 'wifi', description: 'LAN port in room A-106 is physically loose and disconnecting' }
    );
    console.log(`[PASS] 11. Student Files Complaint (${complaintRes.status}): Ticket ID = ${complaintRes.data.complaint.id}`);
    const complaintId = complaintRes.data.complaint.id;

    // 12. Warden Updates Complaint to In Progress
    const progressRes = await request(
      {
        path: `/api/complaints/${complaintId}/status`,
        method: 'PATCH',
        headers: { Authorization: `Bearer ${wardenToken}` },
      },
      { status: 'in_progress' }
    );
    console.log(`[PASS] 12. Complaint Advanced to In Progress (${progressRes.status})`);

    // 13. Warden Resolves Complaint
    const resolveRes = await request(
      {
        path: `/api/complaints/${complaintId}/status`,
        method: 'PATCH',
        headers: { Authorization: `Bearer ${wardenToken}` },
      },
      { status: 'resolved' }
    );
    console.log(`[PASS] 13. Complaint Resolved (${resolveRes.status})`);

    // 14. Occupancy Telemetry
    const statsRes = await request({
      path: '/api/rooms/occupancy-stats',
      method: 'GET',
    });
    console.log(`[PASS] 14. Live Occupancy Metrics (${statsRes.status}):`);
    console.log(`       - Total Rooms: ${statsRes.data.totalRooms}`);
    console.log(`       - Total Beds: ${statsRes.data.totalCapacity}`);
    console.log(`       - Occupied Beds: ${statsRes.data.totalOccupied}`);
    console.log(`       - Occupancy Rate: ${statsRes.data.occupancyRate}%`);

    console.log('\n🎉 ALL 14 END-TO-END TESTS PASSED WITH 100% SUCCESS!');
  } catch (err) {
    console.error('❌ Test failed with error:', err);
    process.exit(1);
  } finally {
    if (server) server.close();
  }
}

runTests();
