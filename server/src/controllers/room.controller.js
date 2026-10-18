const prisma = require('../config/db');

// Get all rooms with optional filtering
async function getRooms(req, res, next) {
  try {
    const { sharingType, status, block, floor } = req.query;

    const rooms = await prisma.room.findMany({
      where: {
        ...(sharingType && { sharingType }),
        ...(status && { status }),
        ...(block && { block }),
        ...(floor && { floor: parseInt(floor, 10) }),
      },
      orderBy: [{ block: 'asc' }, { roomNo: 'asc' }],
    });

    res.json(rooms);
  } catch (err) {
    next(err);
  }
}

// Get single room details
async function getRoomById(req, res, next) {
  try {
    const { id } = req.params;
    const room = await prisma.room.findUnique({
      where: { id },
      include: {
        applications: {
          where: { status: 'approved' },
          include: { student: true },
        },
      },
    });

    if (!room) {
      return res.status(404).json({ message: 'Room not found.' });
    }

    res.json(room);
  } catch (err) {
    next(err);
  }
}

// Get aggregated occupancy statistics for analytics and dashboard
async function getOccupancyStats(req, res, next) {
  try {
    const rooms = await prisma.room.findMany();

    const totalRooms = rooms.length;
    const totalCapacity = rooms.reduce((acc, r) => acc + r.capacity, 0);
    const totalOccupied = rooms.reduce((acc, r) => acc + r.occupiedCount, 0);
    const availableBeds = Math.max(0, totalCapacity - totalOccupied);
    const occupancyRate = totalCapacity > 0 ? Math.round((totalOccupied / totalCapacity) * 100) : 0;

    // Breakdown by tier
    const byTier = {
      single: { capacity: 0, occupied: 0, rooms: 0 },
      double: { capacity: 0, occupied: 0, rooms: 0 },
      triple: { capacity: 0, occupied: 0, rooms: 0 },
      '4-sharing': { capacity: 0, occupied: 0, rooms: 0 },
    };

    rooms.forEach((r) => {
      if (byTier[r.sharingType]) {
        byTier[r.sharingType].rooms += 1;
        byTier[r.sharingType].capacity += r.capacity;
        byTier[r.sharingType].occupied += r.occupiedCount;
      }
    });

    res.json({
      totalRooms,
      totalCapacity,
      totalOccupied,
      availableBeds,
      occupancyRate,
      byTier,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getRooms,
  getRoomById,
  getOccupancyStats,
};
