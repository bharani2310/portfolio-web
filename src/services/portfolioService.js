import api from '../api/axios';

export const profileService = {
  get: () => api.get('/profile').then((res) => res.data),
};

export const experienceService = {
  getAll: () => api.get('/experience').then((res) => res.data),
};

export const skillsService = {
  getAll: () => api.get('/skills').then((res) => res.data),
};

export const projectsService = {
  getAll: () => api.get('/projects').then((res) => res.data),
  getById: (id) => api.get(`/projects/${id}`).then((res) => res.data),
};

export const contactService = {
  send: (payload) => api.post('/contact', payload).then((res) => res.data),
};
