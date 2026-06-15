import { useState } from "react";
import { api } from "../api/client";

export default function RegisterPage({ onNavigate }) {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const res = await api.post("/auth/register", form);
    if (res.id) {
      setSuccess(true);
      setTimeout(() => onNavigate("login"), 1500);
    } else {
      setError(res.detail || "Registration failed");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.logo}>Awaaz</h1>
        <p style={styles.tagline}>Join the Voice of Communities</p>
        {success ? (
          <p style={styles.success}>Registered successfully! Redirecting...</p>
        ) : (
          <form onSubmit={handleSubmit} style={styles.form}>
            <input
              type="text"
              placeholder="Full Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
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
            <button type="submit" style={styles.button}>Register</button>
          </form>
        )}
        <p style={styles.link}>
          Already have an account?{" "}
          <span onClick={() => onNavigate("login")} style={styles.linkText}>
            Login
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
    backgroundColor: "#16a34a",
    color: "white",
    padding: "12px",
    fontSize: "16px",
    marginTop: "8px",
  },
  error: {
    color: "#dc2626",
    fontSize: "13px",
  },
  success: {
    color: "#16a34a",
    fontSize: "14px",
    fontWeight: "600",
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
