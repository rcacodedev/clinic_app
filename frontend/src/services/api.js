import axios from "axios";
import { ACCESS_TOKEN } from "../constants";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    timeout: 50000,
})

api.interceptors.request.use(
    (config) => {
       const token = localStorage.getItem(ACCESS_TOKEN);
       if (token) {
          config.headers.Authorization = `Bearer ${token}`;
       } else {
          console.warn('No se encontró token de autorización');
       }
       return config;
    },
    (error) => {
       return Promise.reject(error);
    }
 );

export default api;