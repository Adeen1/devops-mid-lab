// API configuration that works in dev, Docker, and static hosts (Render)
const getApiBaseUrl = () => {
  // Prefer explicit env override in any mode
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL as string;
  }

  // Development: default to local backend
  if (import.meta.env.DEV) {
    return "http://localhost:5000";
  }

  // Production: same-origin if served behind a proxy (e.g., Docker nginx)
  if (typeof window !== "undefined") {
    return `${window.location.protocol}//${window.location.host}`;
  }

  // Server-side fallback
  return "http://localhost:5000";
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
