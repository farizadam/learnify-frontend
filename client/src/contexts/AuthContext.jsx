import { createContext, useContext, useState, useEffect } from "react";
import { login as loginApi, signup as signupApi } from "../services/authService";
import { safeJson } from "../utils/safeJson";
import { getApiBaseUrl } from "../utils/apiBase";

const AuthContext = createContext();
const BASE_URL = getApiBaseUrl();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // AUTO LOGIN
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { setIsLoading(false); return; }

    fetch(`${BASE_URL}/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async res => {
        if (!res.ok) throw new Error("Token invalide");
        return safeJson(res);
      })
      .then(data => setUser(data))
      .catch(() => {
        localStorage.removeItem("token");
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  // LOGIN
  const login = async (email, password) => {
    const data = await loginApi({ email, password });
    localStorage.setItem("token", data.token);
    setUser(data.user);
    return data.user;
  };

  // SIGNUP
    const signup = async (email, password, firstName = "", lastName = "", role, teacherCode = "") => {
    return signupApi({
      firstName,
      lastName,
      email,
      password,
      role,
      teacherCode,   // ← envoyé au back
    });
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, signup, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);