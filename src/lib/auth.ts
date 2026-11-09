const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000").replace(/\/$/, "");

export type Student = {
  id: number;
  full_name: string;
  email: string;
  experience_level: string;
  learning_goal: string | null;
  preferred_language: string;
  created_at: string;
};

type AuthResponse = { access_token: string; token_type: string };

const TOKEN_KEY = "codementor_access_token";

export function getToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function saveToken(token: string) {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  window.localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: { "Content-Type": "application/json", ...options.headers },
      cache: "no-store",
    });
  } catch {
    throw new Error("Cannot reach CodeMentor AI backend. Make sure FastAPI is running on port 8000.");
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = data.detail;
    const message = Array.isArray(detail)
      ? detail.map((item: { msg?: string }) => item.msg || "Invalid input").join(", ")
      : typeof detail === "string" ? detail : "Something went wrong. Please try again.";
    throw new Error(message);
  }
  return data as T;
}

export async function register(input: {
  full_name: string;
  email: string;
  password: string;
  experience_level: string;
  learning_goal?: string;
}) {
  return request<Student>("/api/v1/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function login(email: string, password: string) {
  const result = await request<AuthResponse>("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  saveToken(result.access_token);
  return result;
}

export async function getMe() {
  const token = getToken();
  if (!token) throw new Error("Please log in to continue.");
  return request<Student>("/api/v1/auth/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export { API_BASE_URL };
