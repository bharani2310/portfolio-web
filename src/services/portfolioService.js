import api from '../api/axios';
import dataApi from '../api/dataApi';

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

// Goes to the Cloudflare Worker (Middleware), not the Render backend.
// The worker buffers the message in KV and batch-flushes it to the
// backend every 6 hours, so the visitor never waits on Render.
export const contactService = {
  send: (payload) => dataApi.post('/contact', payload).then((res) => res.data),
};
