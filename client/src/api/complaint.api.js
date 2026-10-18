import axiosInstance from './axiosInstance';

export const createComplaint = (formData) =>
  axiosInstance.post('/complaints', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const getMyComplaints = () => axiosInstance.get('/complaints/me');
export const getAllComplaints = (params) => axiosInstance.get('/complaints', { params });
export const updateComplaintStatus = (id, data) =>
  axiosInstance.patch(`/complaints/${id}/status`, data);
