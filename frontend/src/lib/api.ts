const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3017/api";

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
}

async function handleResponse(res: Response) {
  if (res.status === 401) {
    const isLoginRequest = res.url.includes("/auth/login");
    if (!isLoginRequest && typeof window !== "undefined") {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    const error = await res.json().catch(() => ({ message: "Credenciales incorrectas" }));
    throw new Error(error.message || "Credenciales incorrectas");
  }
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message || "Error en la solicitud");
  }
  if (res.status === 204) return null;
  return res.json();
}

function getHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export const api = {
  async get<T = unknown>(path: string): Promise<T> {
    const res = await fetch(`${API_URL}${path}`, { headers: getHeaders() });
    return handleResponse(res);
  },

  async post<T = unknown>(path: string, body?: unknown): Promise<T> {
    const res = await fetch(`${API_URL}${path}`, {
      method: "POST",
      headers: getHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    });
    return handleResponse(res);
  },

  async put<T = unknown>(path: string, body?: unknown): Promise<T> {
    const res = await fetch(`${API_URL}${path}`, {
      method: "PUT",
      headers: getHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    });
    return handleResponse(res);
  },

  async patch<T = unknown>(path: string, body?: unknown): Promise<T> {
    const res = await fetch(`${API_URL}${path}`, {
      method: "PATCH",
      headers: getHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    });
    return handleResponse(res);
  },

  async delete<T = unknown>(path: string): Promise<T> {
    const res = await fetch(`${API_URL}${path}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    return handleResponse(res);
  },
};
