const API_BASE_URL = "http://localhost:8000/api/v1";

export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Handle expired or invalid tokens automatically
  if (response.status === 401) {
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token");
      window.location.href = "/sign-in";
    }
    throw new Error("Session expired. Please sign in again.");
  }

  return response;
}