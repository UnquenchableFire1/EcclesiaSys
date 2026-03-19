import axios from 'axios';

// Environment-based API configuration
// default to relative path so frontend works when deployed alongside backend
export const API_URL = process.env.REACT_APP_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for auth tokens
api.interceptors.request.use(
  config => {
    const token = sessionStorage.getItem('authToken');
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
      sessionStorage.removeItem('userId');
      sessionStorage.removeItem('userType');
      sessionStorage.removeItem('userName');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Authentication APIs
export const login = (email, password) => {
  return api.post('/login', { email, password });
};

export const register = (data) => {
  // data should contain at least { name }
  return api.post('/register', data);
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

// Admin APIs
export const getAdmins = () => {
  return api.get('/admins');
};

export const createAdmin = (adminData) => {
  return api.post('/admins', adminData);
};

export const promoteMemberToAdmin = (memberId, data) => {
  return api.post(`/admins/promote/${memberId}`, data);
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

export const createSermon = (sermon) => {
  return api.post('/sermons', sermon);
};

// File upload with multipart form data
export const uploadSermon = (formData) => {
  return api.post('/upload/sermons/upload', formData, {
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

// File upload endpoints
export const uploadProfilePicture = (formData) => {
  return api.post('/upload/profile-picture', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const uploadEventDocument = (formData) => {
  return api.post('/upload/event-document', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// Member Profile APIs
export const getMemberProfile = (memberId) => {
  return api.get(`/member/${memberId}`);
};

export const getCurrentMemberProfile = () => {
  const memberId = sessionStorage.getItem('userId');
  return api.get(`/member/${memberId}`);
};

export const updateMemberProfile = (memberId, data) => {
  return api.put(`/member/${memberId}/profile`, data);
};

export const updateProfilePrivacy = (memberId, isPublic) => {
  return api.put(`/member/${memberId}/privacy`, { isProfilePublic: isPublic });
};

// Admin Profile APIs
export const getAdminProfile = (adminId) => {
  return api.get(`/admins/${adminId}`);
};

export const updateAdminProfile = (adminId, data) => {
  return api.put(`/admins/${adminId}/profile`, data);
};

export const getPublicMembers = () => {
  return api.get('/members/public');
};

export const getPublicMemberProfile = (memberId) => {
  return api.get(`/member/public/${memberId}`);
};

// Prayer Request APIs
export const submitPrayerRequest = (data) => {
  return api.post('/prayer-requests', data);
};

// Profile Picture History
export const getProfilePictureHistory = (userId, userType) => {
    return api.get('/upload/profile-picture/history', { // Changed to use 'api' instance
        params: { userId, userType }
    });
};

export const selectProfilePicture = (userId, userType, url) => {
    return api.post('/upload/profile-picture/select', null, { // Changed to use 'api' instance
        params: { userId, userType, url }
    });
};

export const getPrayerRequests = () => { // Restored original structure, changed to use 'api' instance
  return api.get('/prayer-requests');
};

export const updatePrayerRequestStatus = (id, status) => {
  return api.put(`/prayer-requests/${id}/status`, { status });
};

export const deletePrayerRequest = (id) => {
  return api.delete(`/prayer-requests/${id}`);
};

// Notification APIs
export const getNotifications = (memberId) => {
  return api.get(`/notifications/member/${memberId}`);
};

export const markNotificationAsRead = (id, memberId) => {
  return api.put(`/notifications/${id}/read`, { memberId });
};

export const markAllNotificationsAsRead = (memberId) => {
  return api.put(`/notifications/member/${memberId}/read-all`);
};

export const changePassword = (userType, userId, currentPassword, newPassword, otp) => {
  const endpoint = userType === 'admin' ? `/admins/${userId}/change-password` : `/member/${userId}/change-password`;
  return api.post(endpoint, { currentPassword, newPassword, otp });
};

export default api;

