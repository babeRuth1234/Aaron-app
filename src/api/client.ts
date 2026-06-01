import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Using your local IPv4 address so your physical phone can hit the backend on the same Wi-Fi
export const API_URL = 'https://aaron-backend-qrek.onrender.com/api';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically attach JWT token to every request
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers = config.headers || {};
        // @ts-ignore
        if (config.headers.set) {
          // @ts-ignore
          config.headers.set('Authorization', `Bearer ${token}`);
        } else {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
      }
    } catch (error) {
      console.error('Error reading token from AsyncStorage', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
