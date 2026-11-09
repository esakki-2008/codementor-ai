const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

export type Student = {
  id: number;
  full_name: string;
  email: string;
  experience_level: string;
  learning_goal: string | null;
  preferred_language: string;
  created_at: string;
};

type ApiError = { detail?: string | { msg?: string }[] };

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init.headers },
    cache: "no-store",
  });
  if (!response.ok) {
    let message = "Something went wrong. Please try again.";
    try {
      const body = (await response.json()) as ApiError;
      if (typeof body.detail === "string") message = body.detail;
      else if (Array.isArray(body.detail)) message = body.detail.map((item) => item.msg).filter(Boolean).join(" ");
    } catch { /* Keep the fallback message. */ }
    throw new Error(message);
  }
  return response.json() as Promise<T>;
}

export async function registerStudent(payload: {
  full_name: string; email: string; password: string;
  experience_level: string; learning_goal: string;
}): Promise<Student> {
  return request<Student>("/api/v1/auth/register", { method: "POST", body: JSON.stringify(payload) });
}

export async function loginStudent(email: string, password: string): Promise<string> {
  const result = await request<{ access_token: string; token_type: string }>("/api/v1/auth/login", {
    method: "POST", body: JSON.stringify({ email, password }),
  });
  return result.access_token;
}

export async function getStudent(token: string): Promise<Student> {
  return request<Student>("/api/v1/auth/me", { headers: { Authorization: `Bearer ${token}` } });
}

export { API_BASE };
