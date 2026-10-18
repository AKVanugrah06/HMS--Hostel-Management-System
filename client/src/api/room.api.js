import axiosInstance from './axiosInstance';

export const getRooms = (params) => axiosInstance.get('/rooms', { params });
export const getRoomById = (id) => axiosInstance.get(`/rooms/${id}`);
export const getOccupancyStats = () => axiosInstance.get('/rooms/occupancy-stats');
