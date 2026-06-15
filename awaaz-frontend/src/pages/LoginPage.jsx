import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";

export default function LoginPage({ onNavigate }) {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const res = await api.post("/auth/login", form);
    if (res.access_token) {
      login(res.access_token, { email: form.email });
      onNavigate("home");
    } else {
      setError(res.detail || "Login failed");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.logo}>Awaaz</h1>
        <p style={styles.tagline}>The Voice of Communities</p>
        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          {error && <p style={styles.error}>{error}</p>}
          <button type="submit" style={styles.button}>Login</button>
        </form>
        <p style={styles.link}>
          Don't have an account?{" "}
          <span onClick={() => onNavigate("register")} style={styles.linkText}>
            Register
          </span>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fffbf2",
  },
  card: {
    backgroundColor: "#ffffff",
    padding: "40px",
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
    width: "100%",
    maxWidth: "400px",
    textAlign: "center",
  },
  logo: {
    fontSize: "36px",
    color: "#f97316",
    fontWeight: "800",
  },
  tagline: {
    color: "#6b7280",
    marginBottom: "24px",
    fontSize: "14px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  button: {
    backgroundColor: "#f97316",
    color: "white",
    padding: "12px",
    fontSize: "16px",
    marginTop: "8px",
  },
  error: {
    color: "#dc2626",
    fontSize: "13px",
  },
  link: {
    marginTop: "20px",
    fontSize: "14px",
    color: "#6b7280",
  },
  linkText: {
    color: "#f97316",
    cursor: "pointer",
    fontWeight: "600",
  },
};
