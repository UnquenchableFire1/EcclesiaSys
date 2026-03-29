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
export const getMembers = (branchId) => {
  return api.get('/members', { params: { branchId } });
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

export const assignBranch = (memberId, branchId) => {
  return api.put(`/members/${memberId}/assign-branch`, { branchId });
};

// Admin APIs
export const getAdmins = (branchId) => {
  return api.get('/admins', { params: { branchId } });
};

export const createAdmin = (adminData) => {
  return api.post('/admins', adminData);
};

export const promoteMemberToAdmin = (memberId, data) => {
  return api.post(`/admins/promote/${memberId}`, data);
};

// Announcement APIs
export const getAnnouncements = (branchId) => {
  return api.get('/announcements', { params: { branchId } });
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
export const getEvents = (branchId) => {
  return api.get('/events', { params: { branchId } });
};

export const getUpcomingEvents = (branchId) => {
  return api.get('/events/upcoming', { params: { branchId } });
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
export const getSermons = (branchId) => {
  return api.get('/sermons', { params: { branchId } });
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

export const getPublicMembers = (branchId) => {
  return api.get('/members/public', { params: { branchId } });
};

export const getPublicMemberProfile = (memberId) => {
  return api.get(`/member/public/${memberId}`);
};

// Prayer Request APIs
export const createPrayerRequest = (data) => {
  return api.post('/prayer-requests', data);
};
export const submitPrayerRequest = createPrayerRequest;

export const getPrayerRequests = (branchId) => {
  return api.get('/prayer-requests', { params: { branchId } });
};

export const getMyPrayerRequests = (email) => {
  return api.get('/prayer-requests/my', { params: { email } });
};

export const updatePrayerRequestStatus = (id, status) => {
  return api.put(`/prayer-requests/${id}/status`, { status });
};

export const deletePrayerRequest = (id) => {
  return api.delete(`/prayer-requests/${id}`);
};

export const forwardPrayerRequest = (id, forwarded) => {
  return api.put(`/prayer-requests/${id}/forward`, { forwarded });
};

// Notification APIs
export const getNotifications = (userId, userType) => {
  return api.get(`/notifications/${userType}/${userId}`);
};

export const markNotificationAsRead = (id, userId, userType) => {
  return api.put(`/notifications/${id}/read`, { userId, userType });
};

export const markAllNotificationsAsRead = (userId, userType) => {
  return api.put(`/notifications/${userType}/${userId}/read-all`);
};

export const getCounts = (branchId) => {
    // Ensure undefined is treated as null for the API
    const sanitizedId = branchId === undefined ? null : branchId;
    return api.get('/summary/counts', { params: { branchId: sanitizedId } });
};

export const toggleMemberStatus = (id) => {
    return api.put(`/members/${id}/toggle-status`);
};

export const deleteAdmin = (id) => {
    return api.delete(`/admins/${id}`);
};

// Chat APIs
export const sendChatMessage = (data) => {
  return api.post('/chat/send', data);
};

export const getChatHistory = (user1Id, user2Id) => {
  return api.get('/chat/history', { params: { user1Id, user2Id } });
};

export const getConversations = (userId) => {
  return api.get('/chat/conversations', { params: { userId } });
};

export const markChatMessageAsRead = (messageId) => {
  return api.put('/chat/read', null, { params: { messageId } });
};

export const getAdminTeam = (branchId) => {
    return api.get('/chat/admin-team', { params: { branchId } });
};

export const changePassword = (userType, userId, currentPassword, newPassword, otp) => {
  const endpoint = userType === 'admin' ? `/admins/${userId}/change-password` : `/member/${userId}/change-password`;
  return api.post(endpoint, { currentPassword, newPassword, otp });
};

// Branch APIs
export const getBranches = () => {
  return api.get('/branches');
};

export const deleteBranch = (id) => {
  return api.delete(`/branches/${id}`);
};

export const createBranch = (branchData) => {
  return api.post('/branches', branchData);
};

export default api;

