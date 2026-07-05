import api from '../api/axios';

const multipart = { headers: { 'Content-Type': 'multipart/form-data' } };

export const authService = {
  login: (email, password) =>
    api.post('/auth/login', { email, password }).then((r) => r.data),

  me: () =>
    api.get('/auth/me').then((r) => r.data),

  changePassword: (currentPassword, newPassword) =>
    api.put('/auth/change-password', {
      currentPassword,
      newPassword,
    }).then((r) => r.data),


  generateAdminToken: (email, password) =>
    api.post('/auth/login', {
      email,
      password,
    }).then((r) => r.data),
};

export const adminProfileService = {
  update: (formData) => api.put('/profile', formData, multipart).then((r) => r.data),
};

export const adminExperienceService = {
  create: (payload) => api.post('/experience', payload).then((r) => r.data),
  update: (id, payload) => api.put(`/experience/${id}`, payload).then((r) => r.data),
  remove: (id) => api.delete(`/experience/${id}`).then((r) => r.data),
};

export const adminSkillsService = {
  create: (payload) => api.post('/skills', payload).then((r) => r.data),
  update: (id, payload) => api.put(`/skills/${id}`, payload).then((r) => r.data),
  remove: (id) => api.delete(`/skills/${id}`).then((r) => r.data),
};

export const adminProjectsService = {
  create: (formData) => api.post('/projects', formData, multipart).then((r) => r.data),
  update: (id, formData) => api.put(`/projects/${id}`, formData, multipart).then((r) => r.data),
  remove: (id) => api.delete(`/projects/${id}`).then((r) => r.data),
};

export const adminContactService = {
  getAll: () => api.get('/contact').then((r) => r.data),
  remove: (id) => api.delete(`/contact/${id}`).then((r) => r.data),
  removeConversation: (email) =>
    api.delete(`/contact/conversation/${encodeURIComponent(email)}`).then((r) => r.data),
  markConversationRead: (email) =>
    api.patch(`/contact/conversation/${encodeURIComponent(email)}/read`).then((r) => r.data),
};
