import axios from 'axios';

/**
 * Dedicated client for the Cloudflare Worker (portfolio-middleware),
 * used for:
 *
 *   - GET  /all      the public "get all portfolio data" call, served out
 *                     of a KV cache so GitHub Pages visitors don't wait on
 *                     a possibly-sleeping Render instance. (usePortfolioData.js)
 *
 *   - POST /contact   contact-form submissions. The worker buffers these in
 *                     KV and batch-flushes them to the backend every 6
 *                     hours, so the visitor doesn't wait on Render either.
 *                     (portfolioService.js -> contactService.send)
 *
 * Every route on the worker now requires `Authorization: Bearer <token>`,
 * including GET requests — so every request made with this client needs
 * that header attached. The token itself is a static, publicly-baked-in
 * value (VITE_MIDDLEWARE_API_TOKEN): it gates "is this actually talking to
 * my worker" rather than "who is this person" — it is NOT a secret in the
 * sense of hiding it from users, since anyone can read it out of the
 * built JS bundle or the Network tab. Real admin authorization is still
 * enforced by the backend's own JWT (see ./axios.js).
 *
 * Every other request (admin auth, admin CRUD, reading/deleting messages
 * in the admin inbox) still goes straight to the backend via ./axios.js.
 */
const dataApi = axios.create({
  baseURL:
    import.meta.env.VITE_DATA_API_BASE_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

dataApi.interceptors.request.use((config) => {
  const token = import.meta.env.VITE_MIDDLEWARE_API_TOKEN;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default dataApi;
