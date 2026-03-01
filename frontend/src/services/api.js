import axios from 'axios';

// Environment-based API configuration
export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for auth tokens
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Add response interceptor for error handling
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Clear auth and redirect to login
      localStorage.removeItem('userId');
      localStorage.removeItem('userType');
      localStorage.removeItem('userName');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Authentication APIs
export const login = (email, password, userType) => {
  return api.post('/login', { email, password, userType });
};

export const register = (name, password) => {
  return api.post('/register', { name, password });
};

// Member APIs
export const getMembers = () => {
  return api.get('/members');
};

export const getMemberById = (id) => {
  return api.get(`/members/${id}`);
};

export const updateMember = (member) => {
  return api.put('/members', member);
};

export const deleteMember = (id) => {
  return api.delete(`/members/${id}`);
};

// Announcement APIs
export const getAnnouncements = () => {
  return api.get('/announcements');
};

export const getAnnouncementById = (id) => {
  return api.get(`/announcements/${id}`);
};

export const createAnnouncement = (announcement) => {
  return api.post('/announcements', announcement);
};

export const updateAnnouncement = (announcement) => {
  return api.put('/announcements', announcement);
};

export const deleteAnnouncement = (id) => {
  return api.delete(`/announcements/${id}`);
};

// Event APIs
export const getEvents = () => {
  return api.get('/events');
};

export const getUpcomingEvents = () => {
  return api.get('/events?upcoming=true');
};

export const getEventById = (id) => {
  return api.get(`/events/${id}`);
};

export const createEvent = (event) => {
  return api.post('/events', event);
};

export const updateEvent = (event) => {
  return api.put('/events', event);
};

export const deleteEvent = (id) => {
  return api.delete(`/events/${id}`);
};

// Sermon APIs
export const getSermons = () => {
  return api.get('/sermons');
};

export const getSermonById = (id) => {
  return api.get(`/sermons/${id}`);
};

// File upload with multipart form data
export const uploadSermon = (formData) => {
  return api.post('/sermons/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const updateSermon = (sermon) => {
  return api.put('/sermons', sermon);
};

export const deleteSermon = (id) => {
  return api.delete(`/sermons/${id}`);
};

export default api;
