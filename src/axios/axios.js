import axios from "axios";
import router from "@/router/index";

const axiosInstance = axios.create({
    baseURL: 'http://localhost:8000',
})

axiosInstance.interceptors.response.use(
    response => response,
    error => {
        if (error.code === 'ECONNABORTED' && error.message.includes('timeout')) {
            console.error('Request timeout: ', error);
            return Promise.resolve({ data: 'Request timed out, please try again later' });
        }

        if (!error.response) {
            console.error('Network error: ', error);
            return Promise.resolve({ data: 'Network error, please check your connection' });
        }

        const statusCode = error.response.status;
        if (statusCode === 401) {
            console.error('Unauthorized error: ', error.response);
            router.push({path : "/login"})
            return Promise.resolve({ data: 'Unauthorized, please log in again' });
        }

        if (statusCode >= 400 && statusCode < 500) {
            console.error('Client error: ', error.response);
            return Promise.reject(error);
        }

        if (statusCode >= 500) {
            console.error('Server error: ', error.response);
            return Promise.reject(error);
        }

        console.error('Unexpected error: ', error);
        return Promise.reject(error);
    }
);

export default axiosInstance;
