// src/apiClient.ts (Yeni Dosya)
import axios from 'axios';

// Backend'inizin çalıştığı URL'yi buraya yazın
// Development'ta Vite proxy kullanıyoruz, production'da tam URL olacak
const BASE_URL = import.meta.env.PROD ? 'http://localhost:8080/api' : '/api'; 
const TOKEN_KEY = 'library_auth_token';

const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Axios Interceptor: Her istekten önce Token'ı başlığa ekle
apiClient.interceptors.request.use(config => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, error => {
    return Promise.reject(error);
});

export default apiClient;