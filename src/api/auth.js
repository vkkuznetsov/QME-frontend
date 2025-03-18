import axiosInstance from '@/axios/axios';

export default {
  sendOtp(email) {
    return axiosInstance.post('/auth/send-otp', { email });
  },
  verifyOtp(email, code) {
    return axiosInstance.post('/auth/verify-otp', { email, code });
  },
  superUserLogin(login, password) {
    return axiosInstance.post('/auth/verify-superuser', { login, password });
  },
};