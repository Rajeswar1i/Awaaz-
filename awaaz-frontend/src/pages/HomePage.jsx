import { useState, useEffect } from "react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function HomePage({ onNavigate }) {
  const { logout } = useAuth();
  const [problems, setProblems] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchProblems = async () => {
    setLoading(true);
    const url = search ? `/problems/?search=${search}` : "/problems/";
    const data = await api.get(url);
    setProblems(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => {
    fetchProblems();
  }, []);

  return (
    <div style={styles.container}>
      <nav style={styles.nav}>
        <h1 style={styles.logo}>Awaaz</h1>
        <div style={styles.navRight}>
          <button onClick={() => onNavigate("dashboard")} style={styles.logoutBtn}>
            Dashboard
          </button>
          <button onClick={() => onNavigate("create")} style={styles.createBtn}>
            + Raise Problem
          </button>
          <button onClick={logout} style={styles.logoutBtn}>
            Logout
          </button>
        </div>
      </nav>

      <div style={styles.content}>
        <div style={styles.searchBar}>
          <input
            type="text"
            placeholder="Search problems..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchProblems()}
            style={styles.searchInput}
          />
          <button onClick={fetchProblems} style={styles.searchBtn}>Search</button>
        </div>

        {loading ? (
          <p style={styles.loading}>Loading...</p>
        ) : problems.length === 0 ? (
          <p style={styles.empty}>No problems found. Be the first to raise one!</p>
        ) : (
          <div style={styles.grid}>
            {problems.map((problem) => (
              <div key={problem.id} style={styles.card} onClick={() => onNavigate("problem", problem.id)}>
                <div style={styles.cardHeader}>
                  <span style={styles.status(problem.status)}>{problem.status}</span>
                  <span style={styles.date}>{new Date(problem.created_at).toLocaleDateString()}</span>
                </div>
                {(problem.address || problem.district) && (
                  <p style={styles.address}>
                    📍 {(problem.address || problem.district).slice(0, 60)}{(problem.address || problem.district).length > 60 ? "…" : ""}
                  </p>
                )}
                <h3 style={styles.title}>{problem.title}</h3>
                <p style={styles.description}>{problem.description.slice(0, 100)}...</p>
                <div style={styles.cardFooter}>
                  <span style={styles.category}>Category: {problem.category_id}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: "100vh", backgroundColor: "#fffbf2" },
  nav: {
    backgroundColor: "#f97316",
    padding: "16px 32px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logo: { color: "white", fontSize: "24px", fontWeight: "800" },
  navRight: { display: "flex", gap: "12px" },
  createBtn: { backgroundColor: "white", color: "#f97316", fontWeight: "700" },
  logoutBtn: { backgroundColor: "transparent", color: "white", border: "1px solid white" },
  content: { padding: "32px", maxWidth: "1100px", margin: "0 auto" },
  searchBar: { display: "flex", gap: "12px", marginBottom: "32px" },
  searchInput: { flex: 1 },
  searchBtn: { backgroundColor: "#f97316", color: "white", padding: "10px 24px" },
  loading: { textAlign: "center", color: "#6b7280", marginTop: "60px" },
  empty: { textAlign: "center", color: "#6b7280", marginTop: "60px" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" },
  card: {
    backgroundColor: "white",
    borderRadius: "10px",
    padding: "20px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    cursor: "pointer",
    transition: "transform 0.2s",
  },
  cardHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" },
  status: (s) => ({
    backgroundColor: s === "TRENDING" ? "#eab308" : s === "ARCHIVED" ? "#6b7280" : s === "IN_PROGRESS" ? "#f97316" : "#16a34a",
    color: "white",
    padding: "2px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
  }),
  district: { color: "#6b7280", fontSize: "13px" },
  address: { color: "#6b7280", fontSize: "12px", marginBottom: "8px", marginTop: "-4px" },
  title: { fontSize: "16px", fontWeight: "700", marginBottom: "8px", color: "#2d2d2d" },
  description: { color: "#6b7280", fontSize: "14px", marginBottom: "12px" },
  cardFooter: { display: "flex", justifyContent: "space-between" },
  category: { fontSize: "12px", color: "#f97316", fontWeight: "600" },
  date: { fontSize: "12px", color: "#6b7280" },
};
