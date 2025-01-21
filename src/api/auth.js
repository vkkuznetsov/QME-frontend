import axios from 'axios';

const API_URL = process.env.VUE_APP_API_URL;

export default {
  sendOtp(email) {
    return axios.post(`${API_URL}/auth/send-otp`, { email });
  },
  verifyOtp(email, code) {
    return axios.post(`${API_URL}/auth/verify-otp`, { email, code });
  },
  superUserLogin(login, password) {
    return axios.post(`${API_URL}/auth/verify-superuser`, { login, password });
  },
};