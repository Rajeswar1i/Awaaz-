const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

const getToken = () => localStorage.getItem("access_token");

export const api = {
  get: async (url) => {
    const res = await fetch(`${BASE_URL}${url}`, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
    return res.json();
  },

  post: async (url, body) => {
    const res = await fetch(`${BASE_URL}${url}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(body),
    });
    return res.json();
  },

  patch: async (url, body) => {
    const res = await fetch(`${BASE_URL}${url}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(body),
    });
    return res.json();
  },

  delete: async (url) => {
    const res = await fetch(`${BASE_URL}${url}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
    return res.json();
  },
};
