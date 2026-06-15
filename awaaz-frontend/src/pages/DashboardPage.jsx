import { useState, useEffect } from "react";
import { api } from "../api/client";

const STATUS_META = {
  OPEN:        { icon: "📢", color: "#16a34a", label: "Open" },
  TRENDING:    { icon: "🔥", color: "#eab308", label: "Trending" },
  IN_PROGRESS: { icon: "🔧", color: "#f97316", label: "Being Solved" },
  ARCHIVED:    { icon: "✅", color: "#6b7280", label: "Solved" },
};

export default function DashboardPage({ onNavigate }) {
  const [stats, setStats]           = useState({ total: 0, open: 0, trending: 0, inProgress: 0, archived: 0 });
  const [allProblems, setAllProblems] = useState([]);
  const [trending, setTrending]     = useState([]);
  const [inProgress, setInProgress] = useState([]);
  const [activeFilter, setActiveFilter] = useState(null);
  const [loading, setLoading]       = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    const [statsData, problems, trendingData, inProgressData] = await Promise.all([
      api.get("/problems/stats"),
      api.get("/problems/?limit=100"),
      api.get("/problems/trending?limit=5"),
      api.get("/problems/?limit=20"),
    ]);
    if (statsData && statsData.total !== undefined) {
      setStats({
        total:      statsData.total,
        open:       statsData.open,
        trending:   statsData.trending,
        inProgress: statsData.in_progress,
        archived:   statsData.archived,
      });
    }
    if (Array.isArray(problems)) {
      setAllProblems(problems);
      setInProgress(problems.filter((p) => p.status === "IN_PROGRESS").slice(0, 5));
    }
    setTrending(Array.isArray(trendingData) ? trendingData : []);
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <nav style={styles.nav}>
        <h1 style={styles.logo}>Awaaz</h1>
        <div style={styles.navRight}>
          <button onClick={() => onNavigate("home")} style={styles.navBtn}>Home</button>
          <button onClick={() => onNavigate("create")} style={styles.createBtn}>+ Raise Problem</button>
        </div>
      </nav>

      <div style={styles.content}>
        <h2 style={styles.heading}>Community Dashboard</h2>
        <p style={styles.subheading}>Overview of problems raised by communities</p>

        {loading ? <p style={styles.loading}>Loading...</p> : (
          <>
            {/* Stat Cards */}
            <div style={styles.statsGrid}>
              <div style={styles.statCard("#f97316", activeFilter === "ALL")} onClick={() => setActiveFilter(activeFilter === "ALL" ? null : "ALL")}>
                <div style={styles.statNumber}>{stats.total}</div>
                <div style={styles.statLabel}>Total Raised</div>
              </div>
              <div style={styles.statCard("#16a34a", activeFilter === "OPEN")} onClick={() => setActiveFilter(activeFilter === "OPEN" ? null : "OPEN")}>
                <div style={styles.statIcon}>📢</div>
                <div style={styles.statNumber}>{stats.open}</div>
                <div style={styles.statLabel}>Open</div>
              </div>
              <div style={styles.statCard("#eab308", activeFilter === "TRENDING")} onClick={() => setActiveFilter(activeFilter === "TRENDING" ? null : "TRENDING")}>
                <div style={styles.statIcon}>🔥</div>
                <div style={styles.statNumber}>{stats.trending}</div>
                <div style={styles.statLabel}>Trending</div>
              </div>
              <div style={styles.statCard("#f97316", activeFilter === "IN_PROGRESS")} onClick={() => setActiveFilter(activeFilter === "IN_PROGRESS" ? null : "IN_PROGRESS")}>
                <div style={styles.statIcon}>🔧</div>
                <div style={styles.statNumber}>{stats.inProgress}</div>
                <div style={styles.statLabel}>Being Solved</div>
              </div>
              <div style={styles.statCard("#6b7280", activeFilter === "ARCHIVED")} onClick={() => setActiveFilter(activeFilter === "ARCHIVED" ? null : "ARCHIVED")}>
                <div style={styles.statIcon}>✅</div>
                <div style={styles.statNumber}>{stats.archived}</div>
                <div style={styles.statLabel}>Solved</div>
              </div>
            </div>

            {/* Filtered Problem List */}
            {activeFilter && (
              <div style={styles.filterSection}>
                <div style={styles.filterHeader}>
                  <h3 style={styles.filterTitle}>
                    {activeFilter === "ALL" ? "All Problems" : `${STATUS_META[activeFilter]?.icon} ${STATUS_META[activeFilter]?.label} Problems`}
                  </h3>
                  <button onClick={() => setActiveFilter(null)} style={styles.closeBtn}>✕ Close</button>
                </div>
                {(activeFilter === "ALL" ? allProblems : allProblems.filter((p) => p.status === activeFilter)).length === 0 ? (
                  <p style={styles.empty}>No problems in this category.</p>
                ) : (
                  <div style={styles.filterList}>
                    {(activeFilter === "ALL" ? allProblems : allProblems.filter((p) => p.status === activeFilter)).map((p) => (
                      <div key={p.id} style={styles.filterCard} onClick={() => onNavigate("problem", p.id)}>
                        <div style={styles.info}>
                          <h4 style={styles.listTitle}>{p.title}</h4>
                          <p style={styles.listMeta}>{p.description.slice(0, 80)}…</p>
                          {p.address && <p style={styles.listMeta}>📍 {p.address.slice(0, 60)}</p>}
                        </div>
                        <StatusBadge status={p.status} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Legend */}
            <div style={styles.legend}>
              {Object.entries(STATUS_META).map(([key, val]) => (
                <div key={key} style={styles.legendItem}>
                  <span style={{ fontSize: "18px" }}>{val.icon}</span>
                  <span style={{ ...styles.legendBadge, backgroundColor: val.color }}>{val.label}</span>
                  <span style={styles.legendDesc}>{legendDesc[key]}</span>
                </div>
              ))}
            </div>

            <div style={styles.columns}>
              {/* Trending */}
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>🔥 Top Trending Problems</h3>
                <p style={styles.sectionHint}>High votes + comments → auto-marked Trending by the system</p>
                {trending.length === 0 ? (
                  <p style={styles.empty}>No trending problems yet.</p>
                ) : (
                  <div style={styles.list}>
                    {trending.map((p, i) => (
                      <div key={p.id} style={styles.listCard} onClick={() => onNavigate("problem", p.id)}>
                        <div style={styles.rank}>#{i + 1}</div>
                        <div style={styles.info}>
                          <h4 style={styles.listTitle}>{p.title}</h4>
                          {p.address && <p style={styles.listMeta}>📍 {p.address.slice(0, 50)}…</p>}
                        </div>
                        <StatusBadge status={p.status} />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Being Solved */}
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>🔧 Problems Being Solved</h3>
                <p style={styles.sectionHint}>Admin/moderator marked these as In Progress</p>
                {inProgress.length === 0 ? (
                  <p style={styles.empty}>No problems marked as being solved yet.</p>
                ) : (
                  <div style={styles.list}>
                    {inProgress.map((p) => (
                      <div key={p.id} style={styles.listCard} onClick={() => onNavigate("problem", p.id)}>
                        <div style={styles.info}>
                          <h4 style={styles.listTitle}>{p.title}</h4>
                          {p.address && <p style={styles.listMeta}>📍 {p.address.slice(0, 50)}…</p>}
                        </div>
                        <StatusBadge status={p.status} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const meta = STATUS_META[status] || STATUS_META.OPEN;
  return (
    <span style={{ backgroundColor: meta.color, color: "white", padding: "3px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "600", whiteSpace: "nowrap" }}>
      {meta.icon} {meta.label}
    </span>
  );
}

const legendDesc = {
  OPEN:        "Problem raised, needs attention",
  TRENDING:    "Getting lots of community votes",
  IN_PROGRESS: "Authorities are working on it",
  ARCHIVED:    "Problem has been resolved",
};

const styles = {
  container:   { minHeight: "100vh", backgroundColor: "#fffbf2" },
  nav:         { backgroundColor: "#f97316", padding: "16px 32px", display: "flex", justifyContent: "space-between", alignItems: "center" },
  logo:        { color: "white", fontSize: "24px", fontWeight: "800" },
  navRight:    { display: "flex", gap: "12px" },
  navBtn:      { backgroundColor: "transparent", color: "white", border: "1px solid white" },
  createBtn:   { backgroundColor: "white", color: "#f97316", fontWeight: "700" },
  content:     { maxWidth: "1100px", margin: "0 auto", padding: "40px 32px" },
  heading:     { fontSize: "28px", fontWeight: "800", color: "#2d2d2d", marginBottom: "8px" },
  subheading:  { color: "#6b7280", marginBottom: "32px" },
  loading:     { textAlign: "center", color: "#6b7280", marginTop: "60px" },

  statsGrid:   { display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "16px", marginBottom: "28px" },
  statCard:    (color, active) => ({ backgroundColor: active ? color : "white", borderRadius: "12px", padding: "20px 16px", boxShadow: "0 2px 12px rgba(0,0,0,0.08)", borderTop: `4px solid ${color}`, textAlign: "center", cursor: "pointer", transition: "all 0.2s", color: active ? "white" : "#2d2d2d" }),
  statIcon:    { fontSize: "22px", marginBottom: "4px" },
  statNumber:  { fontSize: "36px", fontWeight: "800", color: "inherit" },
  statLabel:   { fontSize: "13px", color: "inherit", fontWeight: "500", marginTop: "4px", opacity: 0.85 },

  legend:      { display: "flex", gap: "20px", flexWrap: "wrap", backgroundColor: "white", borderRadius: "10px", padding: "16px 20px", marginBottom: "32px", boxShadow: "0 1px 6px rgba(0,0,0,0.06)" },
  legendItem:  { display: "flex", alignItems: "center", gap: "8px" },
  legendBadge: { color: "white", padding: "2px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "600" },
  legendDesc:  { fontSize: "12px", color: "#6b7280" },

  columns:     { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" },
  section:     { backgroundColor: "white", borderRadius: "12px", padding: "28px", boxShadow: "0 2px 12px rgba(0,0,0,0.08)" },
  sectionTitle:{ fontSize: "17px", fontWeight: "700", color: "#2d2d2d", marginBottom: "4px" },
  sectionHint: { fontSize: "12px", color: "#9ca3af", marginBottom: "16px" },
  empty:       { color: "#6b7280", textAlign: "center", padding: "20px", fontSize: "14px" },

  filterSection: { backgroundColor: "white", borderRadius: "12px", padding: "24px", boxShadow: "0 2px 12px rgba(0,0,0,0.08)", marginBottom: "32px" },
  filterHeader:  { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" },
  filterTitle:   { fontSize: "17px", fontWeight: "700", color: "#2d2d2d" },
  closeBtn:      { backgroundColor: "transparent", border: "1px solid #e5e7eb", color: "#6b7280", padding: "4px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "13px" },
  filterList:    { display: "flex", flexDirection: "column", gap: "10px" },
  filterCard:    { display: "flex", alignItems: "center", gap: "16px", padding: "14px 16px", backgroundColor: "#fffbf2", borderRadius: "8px", cursor: "pointer", borderLeft: "3px solid #f97316" },
  list:        { display: "flex", flexDirection: "column", gap: "10px" },
  listCard:    { display: "flex", alignItems: "center", gap: "12px", padding: "14px", backgroundColor: "#fffbf2", borderRadius: "8px", cursor: "pointer", borderLeft: "3px solid #f97316" },
  rank:        { fontSize: "18px", fontWeight: "800", color: "#f97316", width: "32px", flexShrink: 0 },
  info:        { flex: 1 },
  listTitle:   { fontSize: "14px", fontWeight: "700", color: "#2d2d2d", marginBottom: "2px" },
  listMeta:    { fontSize: "12px", color: "#6b7280" },
};
