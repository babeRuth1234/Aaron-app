import axios from 'axios';

// Using your local IPv4 address so your physical phone can hit the backend on the same Wi-Fi
export const API_URL = 'http://192.168.1.105:5001/api';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Optionally add interceptors to attach JWT token if needed
