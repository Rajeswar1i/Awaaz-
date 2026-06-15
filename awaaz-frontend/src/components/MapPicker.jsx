import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix leaflet's default marker icon broken in Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export default function MapPicker({ onLocationSelect }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (mapInstanceRef.current) return;

    const map = L.map(mapRef.current).setView([17.385, 78.4867], 13);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(map);

    map.on("click", (e) => {
      const { lat, lng } = e.latlng;
      placeMarker(map, lat, lng);
    });

    mapInstanceRef.current = map;
  }, []);

  const placeMarker = (map, lat, lng) => {
    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    } else {
      markerRef.current = L.marker([lat, lng], { draggable: true }).addTo(map);
      markerRef.current.on("dragend", (e) => {
        const pos = e.target.getLatLng();
        reverseGeocode(pos.lat, pos.lng);
      });
    }
    reverseGeocode(lat, lng);
  };

  const reverseGeocode = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
      );
      const data = await res.json();
      const address = data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      setSelected(address);
      onLocationSelect({ lat, lng, address });
    } catch {
      const fallback = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      setSelected(fallback);
      onLocationSelect({ lat, lng, address: fallback });
    }
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      const { latitude: lat, longitude: lng } = pos.coords;
      mapInstanceRef.current?.setView([lat, lng], 16);
      placeMarker(mapInstanceRef.current, lat, lng);
    });
  };

  return (
    <div>
      <button type="button" onClick={useMyLocation} style={styles.locateBtn}>
        ⊕ Use My Current Location
      </button>
      <div ref={mapRef} style={styles.map} />
      {selected ? (
        <p style={styles.selectedAddr}>📍 {selected}</p>
      ) : (
        <p style={styles.hint}>Click anywhere on the map to pin the exact problem location</p>
      )}
    </div>
  );
}

const styles = {
  locateBtn: {
    marginBottom: "10px",
    backgroundColor: "#16a34a",
    color: "white",
    padding: "8px 16px",
    fontSize: "13px",
    fontWeight: "600",
    borderRadius: "6px",
    cursor: "pointer",
    border: "none",
  },
  map: {
    width: "100%",
    height: "320px",
    borderRadius: "8px",
    border: "2px solid #e5e7eb",
  },
  selectedAddr: {
    marginTop: "8px",
    fontSize: "13px",
    color: "#16a34a",
    fontWeight: "600",
    backgroundColor: "#f0fdf4",
    padding: "8px 12px",
    borderRadius: "6px",
    border: "1px solid #bbf7d0",
  },
  hint: {
    marginTop: "6px",
    fontSize: "12px",
    color: "#6b7280",
  },
};
