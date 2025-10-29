// API configuration that works in both development and production
const getApiBaseUrl = () => {
  // Check if we're in development mode
  if (import.meta.env.DEV) {
    return import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
  }

  // In production (Docker), use the same origin since nginx proxies /api requests
  if (typeof window !== "undefined") {
    return `${window.location.protocol}//${window.location.host}`;
  }

  // Fallback
  return import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
};

const API_BASE_URL = getApiBaseUrl();

export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  ENDPOINTS: {
    MENU: `${API_BASE_URL}/api/menu`,
    ORDERS: `${API_BASE_URL}/api/orders`,
    ITEMS: `${API_BASE_URL}/api/menu`,
  },
};

export default API_CONFIG;
