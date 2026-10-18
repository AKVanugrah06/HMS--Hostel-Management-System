import axiosInstance from './axiosInstance';

export const getMyPayment = () => axiosInstance.get('/payments/me');
export const submitPayment = (id, formData) =>
  axiosInstance.post(`/payments/${id}/submit`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const getPendingPayments = () => axiosInstance.get('/payments/pending-verification');
export const verifyPayment = (id, decision) =>
  axiosInstance.patch(`/payments/${id}/verify`, decision);
export const downloadReceiptPdf = (id) =>
  axiosInstance.get(`/payments/${id}/receipt`, { responseType: 'blob' });
