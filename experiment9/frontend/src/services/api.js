import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8080',
});

// attach JWT on every request if it exists in storage
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// bounce to login on 401
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  login: (email, password) => API.post('/api/auth/login', { email, password }),
  register: (name, email, password) => API.post('/api/auth/register', { name, email, password }),
  me: () => API.get('/api/auth/me'),
  exchangeOAuthToken: (token) => API.post('/api/auth/oauth2/token', { token }),
};

export const productAPI = {
  list: (page = 0, size = 10, sortBy = 'id') =>
    API.get(`/api/products?page=${page}&size=${size}&sortBy=${sortBy}`),
  get: (id) => API.get(`/api/products/${id}`),
  search: (q) => API.get(`/api/products/search?q=${q}`),
  filter: (min, max) => API.get(`/api/products/filter?min=${min}&max=${max}`),
  create: (data) => API.post('/api/products/create', data),
  update: (id, data) => API.put(`/api/products/${id}`, data),
  delete: (id) => API.delete(`/api/products/delete/${id}`),
};

export const adminAPI = {
  users: () => API.get('/api/admin/users'),
  stats: () => API.get('/api/admin/stats'),
  promote: (id) => API.post(`/api/admin/users/${id}/promote`),
  toggleStatus: (id) => API.post(`/api/admin/users/${id}/toggle`),
};

export default API;
