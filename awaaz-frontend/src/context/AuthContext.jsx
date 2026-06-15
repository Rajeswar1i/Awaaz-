import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

function decodeToken(token) {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return {};
  }
}

export function AuthProvider({ children }) {
  const storedToken = localStorage.getItem("access_token");
  const storedUser = storedToken ? { id: decodeToken(storedToken).sub } : null;

  const [user, setUser] = useState(storedUser);
  const [token, setToken] = useState(storedToken);

  const login = (accessToken, userData) => {
    localStorage.setItem("access_token", accessToken);
    const payload = decodeToken(accessToken);
    setToken(accessToken);
    setUser({ ...userData, id: payload.sub });
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
