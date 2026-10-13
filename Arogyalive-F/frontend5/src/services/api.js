import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8081/api',
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('arogya_token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // JSON request
    if (
      config.data &&
      !(config.data instanceof FormData)
    ) {
      config.headers['Content-Type'] =
        'application/json';
    }

    // File upload
    // Let the browser create multipart/form-data
    // with the correct boundary.
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;


// Used by older mock services
export function simulateRequest(
  data,
  delay = 500,
  shouldFail = false
) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldFail) {
        reject(
          new Error('Request failed')
        );
      } else {
        resolve(data);
      }
    }, delay);
  });
}