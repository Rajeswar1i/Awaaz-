import { useState, useEffect } from "react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function ProblemDetailPage({ problemId, onNavigate }) {
  const { user } = useAuth();
  const [problem, setProblem] = useState(null);
  const [comments, setComments] = useState([]);
  const [images, setImages] = useState([]);
  const [voteCount, setVoteCount] = useState(0);
  const [voteError, setVoteError] = useState("");
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, [problemId]);

  const fetchData = async () => {
    setLoading(true);
    const p = await api.get(`/problems/${problemId}`);
    const c = await api.get(`/problems/${problemId}/comments`);
    const imgs = await api.get(`/problems/${problemId}/images`);
    setProblem(p);
    setComments(Array.isArray(c) ? c : []);
    setImages(Array.isArray(imgs) ? imgs : []);
    setLoading(false);
  };

  const handleVote = async () => {
    setVoteError("");
    const res = await api.post(`/problems/${problemId}/vote`, {});
    if (res.vote_count !== undefined) {
      setVoteCount(res.vote_count);
    } else if (res.detail) {
      setVoteError(res.detail);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this problem?")) return;
    await api.delete(`/problems/${problemId}`);
    onNavigate("home");
  };

  const handleStatusChange = async (newStatus) => {
    const res = await api.patch(`/problems/${problemId}`, { status: newStatus });
    if (res.id) setProblem(res);
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    const res = await api.post(`/problems/${problemId}/comments`, { message: newComment });
    if (res.id) {
      setComments([...comments, res]);
      setNewComment("");
    }
  };

  if (loading) return <div style={styles.loading}>Loading...</div>;
  if (!problem) return <div style={styles.loading}>Problem not found</div>;

  const isOwner = user && user.id === problem.created_by;

  return (
    <div style={styles.container}>
      <nav style={styles.nav}>
        <h1 style={styles.logo}>Awaaz</h1>
        <button onClick={() => onNavigate("home")} style={styles.backBtn}>← Back</button>
      </nav>

      <div style={styles.content}>
        <div style={styles.problemCard}>
          <div style={styles.cardHeader}>
            <span style={styles.status(problem.status)}>{problem.status}</span>
            {isOwner && (
              <button onClick={handleDelete} style={styles.deleteBtn}>Delete</button>
            )}
          </div>
          {problem.address && (
            <p style={styles.location}>📍 {problem.address}</p>
          )}

          {isOwner && (
            <div style={styles.statusRow}>
              <span style={styles.statusLabel}>Update Status:</span>
              {["OPEN", "IN_PROGRESS", "ARCHIVED"].map((s) => (
                <button
                  key={s}
                  onClick={() => handleStatusChange(s)}
                  style={styles.statusBtn(s, problem.status === s)}
                >
                  {s === "OPEN" ? "📢 Open" : s === "IN_PROGRESS" ? "🔧 Being Solved" : "✅ Solved"}
                </button>
              ))}
            </div>
          )}

          <h2 style={styles.title}>{problem.title}</h2>
          <p style={styles.description}>{problem.description}</p>

          <div style={styles.meta}>
            <span style={styles.date}>Posted: {new Date(problem.created_at).toLocaleDateString()}</span>
            {problem.is_anonymous && <span style={styles.anon}>Anonymous</span>}
          </div>

          {images.length > 0 && (
            <div style={styles.imagesSection}>
              {images.map((img) => (
                <img key={img.id} src={img.image_url} alt="problem" style={styles.problemImg} />
              ))}
            </div>
          )}

          <div style={styles.voteSection}>
            <button onClick={handleVote} style={styles.voteBtn}>▲ Support this problem</button>
            {voteCount > 0 && <span style={styles.voteCount}>{voteCount} supporters</span>}
          </div>
          {voteError && <p style={{ color: "#dc2626", fontSize: "13px", marginTop: "8px" }}>{voteError}</p>}
        </div>

        <div style={styles.commentsSection}>
          <h3 style={styles.commentsTitle}>Community Discussion ({comments.length})</h3>
          <form onSubmit={handleComment} style={styles.commentForm}>
            <textarea
              placeholder="Share your thoughts or experiences..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={3}
              style={styles.commentInput}
            />
            <button type="submit" style={styles.commentBtn}>Post Comment</button>
          </form>
          <div style={styles.commentsList}>
            {comments.length === 0 ? (
              <p style={styles.noComments}>No comments yet. Be the first to comment!</p>
            ) : (
              comments.map((c) => (
                <div key={c.id} style={styles.commentCard}>
                  <p style={styles.commentMessage}>{c.message}</p>
                  <span style={styles.commentDate}>{new Date(c.created_at).toLocaleDateString()}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: "100vh", backgroundColor: "#fffbf2" },
  nav: { backgroundColor: "#f97316", padding: "16px 32px", display: "flex", justifyContent: "space-between", alignItems: "center" },
  logo: { color: "white", fontSize: "24px", fontWeight: "800" },
  backBtn: { backgroundColor: "transparent", color: "white", border: "1px solid white" },
  loading: { textAlign: "center", padding: "80px", color: "#6b7280" },
  content: { maxWidth: "780px", margin: "0 auto", padding: "40px 32px" },
  problemCard: { backgroundColor: "white", borderRadius: "12px", padding: "32px", boxShadow: "0 2px 12px rgba(0,0,0,0.08)", marginBottom: "32px" },
  cardHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" },
  status: (s) => ({
    backgroundColor: s === "TRENDING" ? "#eab308" : s === "ARCHIVED" ? "#6b7280" : s === "IN_PROGRESS" ? "#f97316" : "#16a34a",
    color: "white", padding: "4px 12px", borderRadius: "20px", fontSize: "13px", fontWeight: "600",
    whiteSpace: "nowrap", alignSelf: "flex-start", flexShrink: 0,
  }),
  location: { color: "#6b7280", fontSize: "13px", marginBottom: "12px" },
  statusRow: { display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "16px", padding: "12px", backgroundColor: "#fffbf2", borderRadius: "8px", border: "1px dashed #f97316" },
  statusLabel: { fontSize: "13px", fontWeight: "600", color: "#6b7280", marginRight: "4px" },
  statusBtn: (s, active) => ({
    padding: "6px 14px", fontSize: "12px", fontWeight: "600", borderRadius: "20px", cursor: "pointer", border: "2px solid",
    borderColor: s === "IN_PROGRESS" ? "#f97316" : s === "ARCHIVED" ? "#6b7280" : "#16a34a",
    backgroundColor: active ? (s === "IN_PROGRESS" ? "#f97316" : s === "ARCHIVED" ? "#6b7280" : "#16a34a") : "white",
    color: active ? "white" : (s === "IN_PROGRESS" ? "#f97316" : s === "ARCHIVED" ? "#6b7280" : "#16a34a"),
  }),
  deleteBtn: { backgroundColor: "#dc2626", color: "white", padding: "4px 14px", fontSize: "13px", borderRadius: "6px" },
  title: { fontSize: "24px", fontWeight: "800", color: "#2d2d2d", marginBottom: "16px" },
  description: { color: "#4b5563", fontSize: "15px", lineHeight: "1.7", marginBottom: "20px" },
  meta: { display: "flex", gap: "16px", marginBottom: "24px" },
  date: { fontSize: "13px", color: "#6b7280" },
  anon: { fontSize: "13px", color: "#f97316", fontWeight: "600" },
  imagesSection: { display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "20px" },
  problemImg: { width: "160px", height: "120px", objectFit: "cover", borderRadius: "8px", border: "2px solid #e5e7eb" },
  voteSection: { display: "flex", alignItems: "center", gap: "16px" },
  voteBtn: { backgroundColor: "#eab308", color: "white", padding: "10px 24px", fontWeight: "700", fontSize: "15px" },
  voteCount: { color: "#16a34a", fontWeight: "700", fontSize: "15px" },
  commentsSection: { backgroundColor: "white", borderRadius: "12px", padding: "32px", boxShadow: "0 2px 12px rgba(0,0,0,0.08)" },
  commentsTitle: { fontSize: "18px", fontWeight: "700", color: "#2d2d2d", marginBottom: "20px" },
  commentForm: { display: "flex", flexDirection: "column", gap: "10px", marginBottom: "24px" },
  commentInput: { border: "1px solid #e5e7eb", borderRadius: "6px", padding: "10px 12px", fontSize: "14px", resize: "vertical" },
  commentBtn: { backgroundColor: "#16a34a", color: "white", padding: "10px", alignSelf: "flex-end", width: "150px" },
  commentsList: { display: "flex", flexDirection: "column", gap: "12px" },
  noComments: { color: "#6b7280", textAlign: "center", padding: "20px" },
  commentCard: { backgroundColor: "#f9fafb", borderRadius: "8px", padding: "16px", borderLeft: "3px solid #f97316" },
  commentMessage: { color: "#2d2d2d", fontSize: "14px", marginBottom: "8px" },
  commentDate: { color: "#6b7280", fontSize: "12px" },
};
