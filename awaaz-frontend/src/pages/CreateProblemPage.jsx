import { useState, useEffect } from "react";
import { api } from "../api/client";
import MapPicker from "../components/MapPicker";

export default function CreateProblemPage({ onNavigate }) {
  const [categories, setCategories] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [photoUrls, setPhotoUrls] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category_id: "",
    address: "",
    latitude: null,
    longitude: null,
    is_anonymous: false,
  });
  const [showMap, setShowMap] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get("/categories/").then(setCategories);
  }, []);

  const handlePhotoChange = async (e) => {
    const files = Array.from(e.target.files);
    setUploading(true);
    const urls = [];
    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("http://localhost:8000/api/v1/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
        body: formData,
      });
      const data = await res.json();
      if (data.url) urls.push(data.url);
    }
    setPhotoUrls([...photoUrls, ...urls]);
    setPhotos([...photos, ...files]);
    setUploading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await api.post("/problems/", {
      ...form,
      category_id: parseInt(form.category_id),
    });
    if (res.id && photoUrls.length > 0) {
      for (const url of photoUrls) {
        await api.post(`/problems/${res.id}/images`, { image_url: url });
      }
    }
    setLoading(false);
    if (res.id) {
      onNavigate("home");
    } else {
      setError(res.detail || "Failed to create problem");
    }
  };

  return (
    <div style={styles.container}>
      <nav style={styles.nav}>
        <h1 style={styles.logo}>Awaaz</h1>
        <button onClick={() => onNavigate("home")} style={styles.backBtn}>← Back</button>
      </nav>

      <div style={styles.content}>
        <h2 style={styles.heading}>Raise a Problem</h2>
        <p style={styles.subheading}>Help your community by reporting a real issue</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>Title</label>
          <input
            type="text"
            placeholder="Brief title of the problem"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />

          <label style={styles.label}>Description</label>
          <textarea
            placeholder="Describe the problem in detail..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={5}
            required
            style={styles.textarea}
          />

          <label style={styles.label}>Category</label>
          <div style={{ position: "relative" }}>
            <div onClick={() => setShowDropdown(!showDropdown)} style={styles.customSelect}>
              {form.category_id
                ? categories.find((c) => c.id === parseInt(form.category_id))?.name
                : "Select a category"}
              <span style={{ float: "right" }}>▼</span>
            </div>
            {showDropdown && (
              <div style={styles.dropdownList}>
                {categories.map((c) => (
                  <div
                    key={c.id}
                    style={styles.dropdownItem}
                    onClick={() => { setForm({ ...form, category_id: c.id }); setShowDropdown(false); }}
                  >
                    {c.name}
                  </div>
                ))}
              </div>
            )}
          </div>

          <label style={styles.label}>Exact Location</label>
          <input
            type="text"
            placeholder="Type the address or pick from map below"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            style={{ marginBottom: "6px" }}
          />
          <button
            type="button"
            onClick={() => setShowMap(!showMap)}
            style={styles.mapToggleBtn}
          >
            {showMap ? "Hide Map" : "📍 Pick Location on Map"}
          </button>
          {showMap && (
            <MapPicker
              onLocationSelect={({ lat, lng, address }) =>
                setForm({ ...form, latitude: lat, longitude: lng, address })
              }
            />
          )}

          <label style={styles.label}>Upload Photos (optional)</label>
          <label style={styles.uploadBox}>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoChange}
              style={{ display: "none" }}
            />
            {uploading ? "Uploading..." : "Click to select photos"}
          </label>
          {photoUrls.length > 0 && (
            <div style={styles.photoPreview}>
              {photoUrls.map((url, i) => (
                <img key={i} src={url} alt="preview" style={styles.previewImg} />
              ))}
            </div>
          )}

          <label style={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={form.is_anonymous}
              onChange={(e) => setForm({ ...form, is_anonymous: e.target.checked })}
              style={{ width: "auto", marginRight: "8px" }}
            />
            Post anonymously
          </label>

          {error && <p style={styles.error}>{error}</p>}

          <button type="submit" style={styles.submitBtn} disabled={loading || uploading}>
            {loading ? "Submitting..." : "Raise Problem"}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: "100vh", backgroundColor: "#fffbf2" },
  nav: { backgroundColor: "#f97316", padding: "16px 32px", display: "flex", justifyContent: "space-between", alignItems: "center" },
  logo: { color: "white", fontSize: "24px", fontWeight: "800" },
  backBtn: { backgroundColor: "transparent", color: "white", border: "1px solid white" },
  content: { maxWidth: "680px", margin: "0 auto", padding: "40px 32px" },
  heading: { fontSize: "28px", fontWeight: "800", color: "#2d2d2d", marginBottom: "8px" },
  subheading: { color: "#6b7280", marginBottom: "32px" },
  form: { display: "flex", flexDirection: "column", gap: "12px" },
  label: { fontSize: "14px", fontWeight: "600", color: "#2d2d2d" },
  textarea: { border: "1px solid #e5e7eb", borderRadius: "6px", padding: "10px 12px", fontSize: "14px", resize: "vertical" },
  customSelect: { border: "1px solid #e5e7eb", borderRadius: "6px", padding: "10px 12px", fontSize: "14px", backgroundColor: "white", color: "#2d2d2d", cursor: "pointer" },
  dropdownList: { position: "absolute", top: "100%", left: 0, right: 0, backgroundColor: "white", border: "1px solid #e5e7eb", borderRadius: "6px", zIndex: 100, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" },
  dropdownItem: { padding: "10px 12px", fontSize: "14px", color: "#2d2d2d", cursor: "pointer", borderBottom: "1px solid #f3f4f6" },
  row: { display: "flex", gap: "16px" },
  half: { flex: 1, display: "flex", flexDirection: "column", gap: "6px" },
  mapToggleBtn: { backgroundColor: "#f97316", color: "white", padding: "8px 16px", fontSize: "13px", fontWeight: "600", borderRadius: "6px", marginBottom: "10px", cursor: "pointer" },
  uploadBox: { border: "2px dashed #f97316", borderRadius: "8px", padding: "24px", textAlign: "center", cursor: "pointer", color: "#f97316", fontWeight: "600", fontSize: "14px", backgroundColor: "#fff8f3" },
  photoPreview: { display: "flex", gap: "10px", flexWrap: "wrap" },
  previewImg: { width: "80px", height: "80px", objectFit: "cover", borderRadius: "6px", border: "2px solid #e5e7eb" },
  checkboxLabel: { display: "flex", alignItems: "center", fontSize: "14px", color: "#2d2d2d", cursor: "pointer" },
  error: { color: "#dc2626", fontSize: "13px" },
  submitBtn: { backgroundColor: "#f97316", color: "white", padding: "14px", fontSize: "16px", fontWeight: "700", marginTop: "8px" },
};
