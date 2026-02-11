import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api',
  withCredentials: true
});

// Request interceptor to add auth token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Child API endpoints
export const childAPI = {
  getChildren: () => API.get('/child'),
  getChildById: (childId) => API.get(`/child/${childId}`),
  createChild: (childData) => API.post('/child', childData),
  updateChild: (childId, childData) => API.put(`/child/${childId}`, childData),
  deleteChild: (childId) => API.delete(`/child/${childId}`),
  getChildScreeningStatus: (childId) => API.get(`/screening/child/${childId}/screening-status`),
  getChildScreeningsCount: (childId) => API.get(`/screening/child/${childId}/count`),
  getChildScreenings: (childId) => API.get(`/screening/child/${childId}`)
};

export const screeningAPI = {
  calculateScreening: (screeningData) => API.post('/screening/calculate-screening', screeningData),
  getQuestionnaireByType: (type) => API.get(`/screening/questionnaires/${type}`),
  getAvailableQuestionnaires: () => API.get('/screening/available-questionnaires'),
  getScreeningHistory: () => API.get('/screening/screening-history'),
  getSubmissionById: (id) => API.get(`/screening/submission/${id}`),
  downloadSubmissionReport: (id) => API.get(`/screening/submission/${id}/download`, { responseType: 'blob' }),
  getChildScreeningStatus: (childId) => API.get(`/screening/child/${childId}/screening-status`),
  getScreeningStats: () => API.get('/screening/stats'),
  getAvailableCliniciansAndTherapists: () => API.get('/screening/available-clinicians-therapists')
};

export default API;
