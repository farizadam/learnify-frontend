import { createContext, useContext, useState, useEffect } from "react";
import { login as loginApi, signup as signupApi } from "../services/authService";

const AuthContext = createContext();
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

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
      .then(res => {
        if (!res.ok) throw new Error("Token invalide");
        return res.json();
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
  const signup = async (email, password, fullName, role, teacherCode = "") => {
  const names = fullName.trim().split(" ");
  return signupApi({
    firstName: names[0] || "",
    lastName: names.slice(1).join(" ") || "",
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