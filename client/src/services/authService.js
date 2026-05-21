import { safeJson } from "../utils/safeJson";
import { getApiBaseUrl } from "../utils/apiBase";

const API_BASE_URL = getApiBaseUrl();

export async function login(payload) {

  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  console.log("url ", `${API_BASE_URL}/auth/login`);
  console.log("payload ", payload);
  if (!response.ok) {
    const data = await safeJson(response);
    throw new Error(data.message || "Login failed");
  }

  return safeJson(response);
}

export async function signup(payload) {
  console.log("--- DEBUGGING API URL ---");
  console.log("Raw Vite Env Variable:", import.meta.env.VITE_API_URL);
  console.log("Calculated API_BASE_URL Constant:", API_BASE_URL);
  console.log("Full Combined Request URL:", `${API_BASE_URL}/auth/register`);
  console.log("------------------------");
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const data = await safeJson(response);
    throw new Error(data.message || "Signup failed");
  }

  return safeJson(response);
}
