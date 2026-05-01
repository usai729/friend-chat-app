import axios from 'axios';
import useStore from './store';

const API_BASE = 'http://localhost:8000/api'; // Backend at port 8000

const api = axios.create({
  baseURL: API_BASE,
});

// Request interceptor to add token
api.interceptors.request.use((config) => {
  const store = useStore.getState();
  if (store.token) {
    config.headers.Authorization = `Bearer ${store.token}`;
  }
  return config;
});

// Response interceptor for 401 logout
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  signup: (name, email, password, cometchat_uid) => api.post('/auth/register', { name, email, password, cometchat_uid }),
};

export const usersAPI = {
  getUsers: (search = '') => api.get(`/users${search ? `?search=${search}` : ''}`),
};

export const friendRequestsAPI = {
  sendRequest: (targetUserId) => api.post('/friend-requests', { targetUserId }),
  getRequests: () => api.get('/friend-requests'),
  accept: (id) => api.post(`/friend-requests/${id}/accept`),
  reject: (id) => api.post(`/friend-requests/${id}/reject`),
};

export const friendshipsAPI = {
  getFriends: () => api.get('/friendships'),
};

export const conversationsAPI = {
  sendMessage: (receiver_id, message) => api.post('/conversations', { receiver_id, message }),
  getConversation: (friendId) => api.get(`/conversations/${friendId}`),
};

export default api;
