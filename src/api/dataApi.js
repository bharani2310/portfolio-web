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

export default dataApi;
