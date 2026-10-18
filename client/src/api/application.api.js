import axiosInstance from './axiosInstance';

export const applyForRoom = (data) => axiosInstance.post('/applications', data);
export const getMyApplication = () => axiosInstance.get('/applications/me');
export const getAllApplications = (params) => axiosInstance.get('/applications', { params });
export const approveApplication = (id) => axiosInstance.patch(`/applications/${id}/approve`);
export const rejectApplication = (id, reason) => axiosInstance.patch(`/applications/${id}/reject`, { reason });
